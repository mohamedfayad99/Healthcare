import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('healthcare.db');
  }

  // Create Users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      role TEXT,
      profileImage TEXT,
      nationalId TEXT,
      gender TEXT,
      phoneNumber TEXT,
      pushToken TEXT
    );
  `);

  // Create Patients table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      age INTEGER,
      bedNumber TEXT,
      department TEXT,
      mobilityStatus TEXT,
      createdByUserId INTEGER,
      FOREIGN KEY (createdByUserId) REFERENCES Users(id)
    );
  `);

  // Create PositionLogs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS PositionLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER,
      targetPosition TEXT,
      changedAt TEXT,
      changedByUserId INTEGER,
      isMissed INTEGER DEFAULT 0,
      FOREIGN KEY (patientId) REFERENCES Patients(id) ON DELETE CASCADE,
      FOREIGN KEY (changedByUserId) REFERENCES Users(id)
    );
  `);

  console.log('[DB] Database initialized successfully.');
  return db;
};

export const getDB = async () => {
  if (!db) {
    await initDatabase();
  }
  return db;
};
