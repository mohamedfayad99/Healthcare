import { getDB } from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mocks the backend logic using local SQLite database.
 * Returns { data: ... } format to maintain compatibility with screens.
 */
const localApiService = {
  // --- AUTH ---
  login: async (username, password) => {
    const db = await getDB();
    const user = await db.getFirstAsync('SELECT * FROM Users WHERE username = ?', [username]);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Since it's a local app for one phone, we don't strictly need JWT. 
    // We'll return a mock "token" which is just the username for now.
    const token = `local-token-${user.id}`;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('currentUserId', user.id.toString());

    return {
      data: {
        token,
        username: user.username,
        role: user.role
      }
    };
  },

  register: async (dto) => {
    const db = await getDB();
    try {
      await db.runAsync(
        'INSERT INTO Users (username, role, profileImage, nationalId, gender, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)',
        [dto.username, dto.role || 'Nurse', dto.profileImage || '', dto.nationalId || '', dto.gender || '', dto.phoneNumber || '']
      );
      return { data: { message: 'User registered successfully' } };
    } catch (e) {
      if (e.message.includes('UNIQUE constraint failed')) {
        throw new Error('Username already exists');
      }
      throw e;
    }
  },

  getMe: async () => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    const user = await db.getFirstAsync('SELECT * FROM Users WHERE id = ?', [parseInt(userId)]);
    return { data: user };
  },

  updateProfile: async (dto) => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    if (dto.username) {
        await db.runAsync('UPDATE Users SET username = ? WHERE id = ?', [dto.username, parseInt(userId)]);
    }
    if (dto.phoneNumber) {
        await db.runAsync('UPDATE Users SET phoneNumber = ? WHERE id = ?', [dto.phoneNumber, parseInt(userId)]);
    }
    
    const user = await db.getFirstAsync('SELECT * FROM Users WHERE id = ?', [parseInt(userId)]);
    return { data: { message: "Profile updated successfully", username: user.username, phoneNumber: user.phoneNumber } };
  },

  updateProfileImage: async (imageBase64) => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    await db.runAsync('UPDATE Users SET profileImage = ? WHERE id = ?', [imageBase64, parseInt(userId)]);
    return { data: { message: "Profile image updated successfully", profileImage: imageBase64 } };
  },

  // --- PATIENTS ---
  getPatients: async () => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    const patients = await db.getAllAsync('SELECT * FROM Patients WHERE createdByUserId = ?', [parseInt(userId)]);
    
    // For each patient, fetch the last position log
    for (let p of patients) {
      const lastLog = await db.getFirstAsync(
        'SELECT * FROM PositionLogs WHERE patientId = ? ORDER BY changedAt DESC LIMIT 1',
        [p.id]
      );
      p.lastPositionLog = lastLog;
    }

    return { data: patients };
  },

  getPatientById: async (id) => {
    const db = await getDB();
    const patient = await db.getFirstAsync('SELECT * FROM Patients WHERE id = ?', [id]);
    const lastLog = await db.getFirstAsync(
      'SELECT * FROM PositionLogs WHERE patientId = ? ORDER BY changedAt DESC LIMIT 1',
      [id]
    );

    return { data: { patient, lastPositionLog: lastLog } };
  },

  createPatient: async (dto) => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    const result = await db.runAsync(
      'INSERT INTO Patients (fullName, age, bedNumber, department, mobilityStatus, createdByUserId) VALUES (?, ?, ?, ?, ?, ?)',
      [dto.fullName, dto.age, dto.bedNumber, dto.department, dto.mobilityStatus, parseInt(userId)]
    );

    const newPatient = await db.getFirstAsync('SELECT * FROM Patients WHERE id = ?', [result.lastInsertRowId]);
    return { data: newPatient };
  },

  deletePatient: async (id) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM Patients WHERE id = ?', [id]);
    return { data: { message: 'Patient deleted successfully' } };
  },

  // --- POSITIONS ---
  getPositionLogs: async (patientId) => {
    const db = await getDB();
    const logs = await db.getAllAsync(
      `SELECT pl.*, u.username as ChangedByInfo 
       FROM PositionLogs pl 
       LEFT JOIN Users u ON pl.changedByUserId = u.id 
       WHERE pl.patientId = ? 
       ORDER BY pl.changedAt DESC`,
      [patientId]
    );
    return { data: logs };
  },

  addPositionLog: async (patientId, targetPosition) => {
    const db = await getDB();
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('Unauthorized');

    const changedAt = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO PositionLogs (patientId, targetPosition, changedAt, changedByUserId, isMissed) VALUES (?, ?, ?, ?, ?)',
      [patientId, targetPosition, changedAt, parseInt(userId), 0]
    );

    const user = await db.getFirstAsync('SELECT username FROM Users WHERE id = ?', [parseInt(userId)]);
    const newLog = {
      id: result.lastInsertRowId,
      targetPosition,
      changedAt,
      ChangedByInfo: user ? user.username : 'User',
      isMissed: 0
    };

    return { data: newLog };
  },

  getOccupiedBeds: async () => {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT bedNumber FROM Patients');
    return { data: rows.map(r => r.bedNumber) };
  }
};

export default localApiService;
