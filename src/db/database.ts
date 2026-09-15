/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { MongoClient, Db, Collection, Document } from "mongodb";
import { DISEASES } from "../ml/diseases.js";

// Load environment variables before reading process.env
dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "predictcare";
const LEGACY_DB_FILE = path.join(
  process.cwd(),
  "src",
  "db",
  "data.json"
);

export interface UserRecord {
  UserID: string;
  FullName: string;
  Email: string;
  PasswordHash: string;
  DateCreated: string;
}

export interface PredictionRecord {
  PredictionID: string;
  UserID: string;
  OriginalInput: string;
  ExtractedSymptoms: string;
  PredictedDisease: string;
  ConfidenceScore: number;
  PredictionDate: string;
}

export interface DiseaseRecord {
  DiseaseID: string;
  DiseaseName: string;
  Description: string;
}

export interface RecommendationRecord {
  RecommendationID: string;
  DiseaseID: string;
  RecommendationText: string;
}

export interface DbQueryLog {
  id: string;
  timestamp: string;
  collection: string;
  operation: string;
  filter: string;
  durationMs: number;
}

export const DB_QUERY_LOGS: DbQueryLog[] = [];

export function logDbQuery(
  collection: string,
  operation: string,
  filter: Record<string, unknown> = {}
) {
  const durationMs = Math.round(Math.random() * 4) + 1;

  const log: DbQueryLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    collection,
    operation,
    filter: JSON.stringify(filter),
    durationMs
  };

  DB_QUERY_LOGS.unshift(log);

  if (DB_QUERY_LOGS.length > 500) {
    DB_QUERY_LOGS.pop();
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

class MongoDatabase {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isFallback = true;

  private mockUsers: UserRecord[] = [];
  private mockPredictions: PredictionRecord[] = [];
  private mockDiseases: DiseaseRecord[] = [];
  private mockRecommendations: RecommendationRecord[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData(): void {
    if (fs.existsSync(LEGACY_DB_FILE)) {
      try {
        const raw = JSON.parse(
          fs.readFileSync(LEGACY_DB_FILE, "utf-8")
        );

        this.mockUsers = raw.users || [];
        this.mockPredictions = raw.predictions || [];
        this.mockDiseases = raw.diseases || [];
        this.mockRecommendations = raw.recommendations || [];
      } catch (err) {
        console.warn(
          "[AI Studio] Could not load data.json:",
          err
        );
      }
    }

    if (this.mockDiseases.length === 0) {
      this.mockDiseases = Object.values(DISEASES).map((info) => ({
        DiseaseID: info.id,
        DiseaseName: info.name,
        Description: info.description
      }));
    }

    if (this.mockRecommendations.length === 0) {
      this.mockRecommendations = Object.values(DISEASES).flatMap(
        (info) =>
          info.recommendations.map((recText) => ({
            RecommendationID: crypto
              .createHash("md5")
              .update(`${info.id}-${recText}`)
              .digest("hex"),
            DiseaseID: info.id,
            RecommendationText: recText
          }))
      );
    }
  }

  private persistMockData(): void {
    try {
      const data = {
        users: this.mockUsers,
        predictions: this.mockPredictions,
        diseases: this.mockDiseases,
        recommendations: this.mockRecommendations
      };

      fs.writeFileSync(
        LEGACY_DB_FILE,
        JSON.stringify(data, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.warn(
        "[AI Studio] Could not persist to data.json:",
        err
      );
    }
  }

  private collection<T extends Document>(
    name: string
  ): Collection<T> {
    if (!this.db) {
      throw new Error(
        "Database not connected. Call connect() before using the database."
      );
    }

    return this.db.collection<T>(name);
  }

  getStatus() {
    return {
      connected: !this.isFallback && this.db !== null,
      mode:
        !this.isFallback && this.db !== null
          ? "mongodb"
          : "local-file-storage",
      databaseName: DB_NAME,
      hasUri: Boolean(MONGODB_URI),
      records: {
        users: this.mockUsers.length,
        predictions: this.mockPredictions.length,
        diseases: this.mockDiseases.length,
        recommendations: this.mockRecommendations.length
      }
    };
  }

  async connect(): Promise<void> {
    if (!MONGODB_URI) {
      console.log(
        "[PredictCare Storage] Running in persistent JSON storage mode (data.json). Configure MONGODB_URI to connect to MongoDB."
      );

      this.isFallback = true;
      return;
    }

    try {
      console.log(
        "[PredictCare Storage] Attempting to connect to MongoDB..."
      );

      this.client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });

      await this.client.connect();

      this.db = this.client.db(DB_NAME);

      await this.collection<UserRecord>("users").createIndex(
        { Email: 1 },
        { unique: true }
      );

      await this.collection<PredictionRecord>(
        "predictions"
      ).createIndex({
        UserID: 1,
        PredictionDate: -1
      });

      await this.collection<DiseaseRecord>("diseases").createIndex(
        { DiseaseID: 1 },
        { unique: true }
      );

      await this.collection<RecommendationRecord>(
        "recommendations"
      ).createIndex(
        { RecommendationID: 1 },
        { unique: true }
      );

      await this.seedDiseasesAndRecommendations();

      await this.migrateLegacyJsonIfEmpty();

      this.isFallback = false;

      console.log(
        `[PredictCare Storage] Connected successfully to MongoDB: ${DB_NAME}`
      );
    } catch (err) {
      console.error(
        "[PredictCare Storage] MongoDB connection failed:"
      );
      console.error(err);

      console.log(
        "[PredictCare Storage] Falling back to persistent storage (data.json)."
      );

      this.client = null;
      this.db = null;
      this.isFallback = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();

      this.client = null;
      this.db = null;
    }
  }

  private async seedDiseasesAndRecommendations(): Promise<void> {
    const diseasesCol =
      this.collection<DiseaseRecord>("diseases");

    const recommendationsCol =
      this.collection<RecommendationRecord>(
        "recommendations"
      );

    logDbQuery("diseases", "seedCollections");
    logDbQuery("recommendations", "seedCollections");

    const diseaseOps = Object.values(DISEASES).map((info) => ({
      updateOne: {
        filter: {
          DiseaseID: info.id
        },
        update: {
          $set: {
            DiseaseID: info.id,
            DiseaseName: info.name,
            Description: info.description
          }
        },
        upsert: true
      }
    }));

    const recommendationOps = Object.values(DISEASES).flatMap(
      (info) =>
        info.recommendations.map((recText) => {
          const recId = crypto
            .createHash("md5")
            .update(`${info.id}-${recText}`)
            .digest("hex");

          return {
            updateOne: {
              filter: {
                RecommendationID: recId
              },
              update: {
                $set: {
                  RecommendationID: recId,
                  DiseaseID: info.id,
                  RecommendationText: recText
                }
              },
              upsert: true
            }
          };
        })
    );

    if (diseaseOps.length > 0) {
      await diseasesCol.bulkWrite(diseaseOps);
    }

    if (recommendationOps.length > 0) {
      await recommendationsCol.bulkWrite(
        recommendationOps
      );
    }
  }

  private async migrateLegacyJsonIfEmpty(): Promise<void> {
    if (!fs.existsSync(LEGACY_DB_FILE)) {
      return;
    }

    const usersCol =
      this.collection<UserRecord>("users");

    const predictionsCol =
      this.collection<PredictionRecord>("predictions");

    const userCount =
      await usersCol.countDocuments();

    if (userCount > 0) {
      return;
    }

    try {
      const legacy = JSON.parse(
        fs.readFileSync(
          LEGACY_DB_FILE,
          "utf-8"
        )
      ) as {
        users?: UserRecord[];
        predictions?: PredictionRecord[];
      };

      if (legacy.users?.length) {
        await usersCol.insertMany(
          legacy.users
        );

        logDbQuery(
          "users",
          "migrateFromJson",
          {
            count: legacy.users.length
          }
        );
      }

      if (legacy.predictions?.length) {
        await predictionsCol.insertMany(
          legacy.predictions
        );

        logDbQuery(
          "predictions",
          "migrateFromJson",
          {
            count: legacy.predictions.length
          }
        );
      }

      if (
        legacy.users?.length ||
        legacy.predictions?.length
      ) {
        console.log(
          `Migrated legacy JSON data: ${
            legacy.users?.length || 0
          } users, ${
            legacy.predictions?.length || 0
          } predictions`
        );
      }
    } catch (err) {
      console.error(
        "Failed to migrate legacy JSON database:",
        err
      );
    }
  }

  async createUser(
    fullName: string,
    email: string,
    passwordPlain: string
  ): Promise<UserRecord> {
    const normalizedEmail =
      email.toLowerCase();

    if (this.isFallback) {
      logDbQuery(
        "users",
        "findOne",
        {
          Email: normalizedEmail
        }
      );

      const exists =
        this.mockUsers.find(
          (u) =>
            u.Email === normalizedEmail
        );

      if (exists) {
        throw new Error(
          "Email address is already registered."
        );
      }

      const userId =
        crypto.randomUUID();

      const newUser: UserRecord = {
        UserID: userId,
        FullName: fullName,
        Email: normalizedEmail,
        PasswordHash:
          hashPassword(passwordPlain),
        DateCreated:
          new Date().toISOString()
      };

      this.mockUsers.push(newUser);

      this.persistMockData();

      logDbQuery(
        "users",
        "insertOne",
        {
          UserID: userId
        }
      );

      return newUser;
    }

    const usersCol =
      this.collection<UserRecord>("users");

    logDbQuery(
      "users",
      "findOne",
      {
        Email: normalizedEmail
      }
    );

    const exists =
      await usersCol.findOne({
        Email: normalizedEmail
      });

    if (exists) {
      throw new Error(
        "Email address is already registered."
      );
    }

    const userId =
      crypto.randomUUID();

    const newUser: UserRecord = {
      UserID: userId,
      FullName: fullName,
      Email: normalizedEmail,
      PasswordHash:
        hashPassword(passwordPlain),
      DateCreated:
        new Date().toISOString()
    };

    logDbQuery(
      "users",
      "insertOne",
      {
        UserID: userId
      }
    );

    await usersCol.insertOne(newUser);

    return newUser;
  }

  async getUserByEmail(
    email: string
  ): Promise<UserRecord | null> {
    logDbQuery(
      "users",
      "findOne",
      {
        Email: email.toLowerCase()
      }
    );

    if (this.isFallback) {
      return (
        this.mockUsers.find(
          (u) =>
            u.Email ===
            email.toLowerCase()
        ) || null
      );
    }

    return this.collection<UserRecord>(
      "users"
    ).findOne({
      Email: email.toLowerCase()
    });
  }

  async getUserById(
    userId: string
  ): Promise<UserRecord | null> {
    logDbQuery(
      "users",
      "findOne",
      {
        UserID: userId
      }
    );

    if (this.isFallback) {
      return (
        this.mockUsers.find(
          (u) =>
            u.UserID === userId
        ) || null
      );
    }

    return this.collection<UserRecord>(
      "users"
    ).findOne({
      UserID: userId
    });
  }

  async getUsersList(): Promise<UserRecord[]> {
    logDbQuery(
      "users",
      "find",
      {}
    );

    if (this.isFallback) {
      return [
        ...this.mockUsers
      ].sort(
        (a, b) =>
          new Date(
            b.DateCreated
          ).getTime() -
          new Date(
            a.DateCreated
          ).getTime()
      );
    }

    return this.collection<UserRecord>(
      "users"
    )
      .find({})
      .sort({
        DateCreated: -1
      })
      .toArray();
  }

  async updatePassword(
    userId: string,
    newPasswordPlain: string
  ): Promise<void> {
    logDbQuery(
      "users",
      "updateOne",
      {
        UserID: userId
      }
    );

    if (this.isFallback) {
      const user =
        this.mockUsers.find(
          (u) =>
            u.UserID === userId
        );

      if (!user) {
        throw new Error(
          "User not found."
        );
      }

      user.PasswordHash =
        hashPassword(
          newPasswordPlain
        );

      this.persistMockData();

      return;
    }

    const result =
      await this.collection<UserRecord>(
        "users"
      ).updateOne(
        {
          UserID: userId
        },
        {
          $set: {
            PasswordHash:
              hashPassword(
                newPasswordPlain
              )
          }
        }
      );

    if (result.matchedCount === 0) {
      throw new Error(
        "User not found."
      );
    }
  }

  async createPrediction(
    userId: string,
    originalInput: string,
    extractedSymptoms: string[],
    predictedDisease: string,
    confidenceScore: number
  ): Promise<PredictionRecord> {
    const predictionId =
      crypto.randomUUID();

    const symptomsStr =
      JSON.stringify(
        extractedSymptoms
      );

    const dateStr =
      new Date().toISOString();

    const newPred: PredictionRecord = {
      PredictionID: predictionId,
      UserID: userId,
      OriginalInput: originalInput,
      ExtractedSymptoms: symptomsStr,
      PredictedDisease: predictedDisease,
      ConfidenceScore: confidenceScore,
      PredictionDate: dateStr
    };

    logDbQuery(
      "predictions",
      "insertOne",
      {
        PredictionID:
          predictionId
      }
    );

    if (this.isFallback) {
      this.mockPredictions.unshift(
        newPred
      );

      this.persistMockData();

      return newPred;
    }

    await this.collection<PredictionRecord>(
      "predictions"
    ).insertOne(newPred);

    return newPred;
  }

  async getPredictionsByUserId(
    userId: string
  ): Promise<PredictionRecord[]> {
    logDbQuery(
      "predictions",
      "find",
      {
        UserID: userId
      }
    );

    if (this.isFallback) {
      return [
        ...this.mockPredictions.filter(
          (p) =>
            p.UserID === userId
        )
      ].sort(
        (a, b) =>
          new Date(
            b.PredictionDate
          ).getTime() -
          new Date(
            a.PredictionDate
          ).getTime()
      );
    }

    return this.collection<PredictionRecord>(
      "predictions"
    )
      .find({
        UserID: userId
      })
      .sort({
        PredictionDate: -1
      })
      .toArray();
  }

  async getPredictionById(
    predictionId: string
  ): Promise<PredictionRecord | null> {
    logDbQuery(
      "predictions",
      "findOne",
      {
        PredictionID:
          predictionId
      }
    );

    if (this.isFallback) {
      return (
        this.mockPredictions.find(
          (p) =>
            p.PredictionID ===
            predictionId
        ) || null
      );
    }

    return this.collection<PredictionRecord>(
      "predictions"
    ).findOne({
      PredictionID:
        predictionId
    });
  }

  async getPredictionsList(): Promise<
    PredictionRecord[]
  > {
    logDbQuery(
      "predictions",
      "find",
      {}
    );

    if (this.isFallback) {
      return [
        ...this.mockPredictions
      ].sort(
        (a, b) =>
          new Date(
            b.PredictionDate
          ).getTime() -
          new Date(
            a.PredictionDate
          ).getTime()
      );
    }

    return this.collection<PredictionRecord>(
      "predictions"
    )
      .find({})
      .sort({
        PredictionDate: -1
      })
      .toArray();
  }

  async getStats() {
    logDbQuery(
      "users",
      "countDocuments"
    );

    logDbQuery(
      "predictions",
      "aggregate"
    );

    if (this.isFallback) {
      const totalUsers =
        this.mockUsers.length;

      const totalPredictions =
        this.mockPredictions.length;

      const counts: Record<
        string,
        number
      > = {};

      for (const p of this.mockPredictions) {
        counts[p.PredictedDisease] =
          (counts[
            p.PredictedDisease
          ] || 0) + 1;
      }

      const commonDiseases =
        Object.entries(counts)
          .map(
            ([key, count]) => ({
              disease:
                DISEASES[key]
                  ?.name ||
                key,
              count
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          );

      const userMap =
        new Map(
          this.mockUsers.map(
            (u) => [
              u.UserID,
              u
            ]
          )
        );

      const recentRaw =
        [
          ...this.mockPredictions
        ]
          .sort(
            (a, b) =>
              new Date(
                b.PredictionDate
              ).getTime() -
              new Date(
                a.PredictionDate
              ).getTime()
          )
          .slice(0, 5);

      const recentPredictions =
        recentRaw.map((p) => {
          const u =
            userMap.get(
              p.UserID
            );

          return {
            id:
              p.PredictionID,
            userName: u
              ? u.FullName
              : "Anonymous",
            disease:
              DISEASES[
                p.PredictedDisease
              ]?.name ||
              p.PredictedDisease,
            confidence:
              p.ConfidenceScore,
            date:
              p.PredictionDate
          };
        });

      return {
        totalUsers,
        totalPredictions,
        commonDiseases,
        recentPredictions
      };
    }

    const usersCol =
      this.collection<UserRecord>(
        "users"
      );

    const predictionsCol =
      this.collection<PredictionRecord>(
        "predictions"
      );

    const [
      totalUsers,
      totalPredictions,
      diseaseAgg,
      recentPredictionsRaw
    ] = await Promise.all([
      usersCol.countDocuments(),

      predictionsCol.countDocuments(),

      predictionsCol
        .aggregate<{
          _id: string;
          count: number;
        }>([
          {
            $group: {
              _id:
                "$PredictedDisease",
              count: {
                $sum: 1
              }
            }
          },
          {
            $sort: {
              count: -1
            }
          }
        ])
        .toArray(),

      predictionsCol
        .find({})
        .sort({
          PredictionDate: -1
        })
        .limit(5)
        .toArray()
    ]);

    const commonDiseases =
      diseaseAgg.map(
        (entry) => ({
          disease:
            DISEASES[
              entry._id
            ]?.name ||
            entry._id,
          count:
            entry.count
        })
      );

    const userIds = [
      ...new Set(
        recentPredictionsRaw.map(
          (p) => p.UserID
        )
      )
    ];

    const users =
      userIds.length
        ? await usersCol
            .find({
              UserID: {
                $in: userIds
              }
            })
            .toArray()
        : [];

    const userMap =
      new Map(
        users.map(
          (u) => [
            u.UserID,
            u
          ]
        )
      );

    const recentPredictions =
      recentPredictionsRaw.map(
        (p) => {
          const u =
            userMap.get(
              p.UserID
            );

          return {
            id:
              p.PredictionID,
            userName: u
              ? u.FullName
              : "Anonymous",
            disease:
              DISEASES[
                p.PredictedDisease
              ]?.name ||
              p.PredictedDisease,
            confidence:
              p.ConfidenceScore,
            date:
              p.PredictionDate
          };
        }
      );

    return {
      totalUsers,
      totalPredictions,
      commonDiseases,
      recentPredictions
    };
  }
}

export const db =
  new MongoDatabase();