import fs from 'fs';
import path from 'path';

export class UserManager {
  static getBaseDataDir() {
    return path.join(process.cwd(), 'uploads');
  }

  static getUserBaseFolder(userId) {
    return path.join(this.getBaseDataDir(), userId);
  }

  static getUserDataFolder(userId) {
    return path.join(this.getBaseDataDir(), userId, `data_files_${userId}`);
  }

  static getUserVectordbFolder(userId) {
    return path.join(this.getBaseDataDir(), userId, `vector_db_${userId}`);
  }

  static getUserStateFile(userId) {
    return path.join(this.getBaseDataDir(), userId, `processed_files_${userId}.json`);
  }

  static createUserDirectories(userId) {
    const userBaseFolder = this.getUserBaseFolder(userId);
    const dataFolder = this.getUserDataFolder(userId);
    const vectordbFolder = this.getUserVectordbFolder(userId);

    // Create directories if they don't exist
    fs.mkdirSync(userBaseFolder, { recursive: true });
    fs.mkdirSync(dataFolder, { recursive: true });
    fs.mkdirSync(vectordbFolder, { recursive: true });

    return { dataFolder, vectordbFolder };
  }

  static deleteUserData(userId) {
    const userBaseFolder = this.getUserBaseFolder(userId);
    
    if (fs.existsSync(userBaseFolder)) {
      fs.rmSync(userBaseFolder, { recursive: true, force: true });
    }
  }

  static getUserProcessedFiles(userId) {
    const stateFile = this.getUserStateFile(userId);
    
    if (fs.existsSync(stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      } catch (error) {
        console.error('Error reading processed files:', error);
        return {};
      }
    }
    return {};
  }

  static saveUserProcessedFiles(userId, processedFiles) {
    const stateFile = this.getUserStateFile(userId);
    
    try {
      fs.writeFileSync(stateFile, JSON.stringify(processedFiles, null, 2));
    } catch (error) {
      console.error('Error saving processed files:', error);
      throw error;
    }
  }

  static listUserFiles(userId) {
    const dataFolder = this.getUserDataFolder(userId);
    
    if (!fs.existsSync(dataFolder)) {
      return [];
    }

    try {
      const files = fs.readdirSync(dataFolder);
      return files.filter(file => 
        file.toLowerCase().endsWith('.pdf') || 
        file.toLowerCase().endsWith('.docx')
      ).map(file => ({
        name: file,
        path: path.join(dataFolder, file),
        size: fs.statSync(path.join(dataFolder, file)).size,
        modified: fs.statSync(path.join(dataFolder, file)).mtime
      }));
    } catch (error) {
      console.error('Error listing user files:', error);
      return [];
    }
  }
}