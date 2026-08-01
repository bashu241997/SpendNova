export interface DriveFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export const listDriveBackups = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    const response = await fetch(
      `${DRIVE_API_URL}?q=(name='spendnova_backup.json' or name='ledgeit_backup.json') and trashed=false&fields=files(id,name,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list backups');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Drive list error:', error);
    return [];
  }
};

export const downloadDriveBackup = async (fileId: string, accessToken: string): Promise<any> => {
  try {
    const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return await response.json();
  } catch (error) {
    console.error('Drive download error:', error);
    return null;
  }
};

export const uploadDriveBackup = async (fileContent: string, accessToken: string, existingFileId?: string): Promise<boolean> => {
  try {
    const metadata = {
      name: 'spendnova_backup.json',
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    let url = `${DRIVE_UPLOAD_URL}?uploadType=multipart`;
    let method = 'POST';

    if (existingFileId) {
      url = `${DRIVE_UPLOAD_URL}/${existingFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive upload error response:', errorText);
      throw new Error('Failed to upload backup');
    }

    return true;
  } catch (error) {
    console.error('Drive upload error:', error);
    return false;
  }
};

export const deleteDriveBackup = async (fileId: string, accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${DRIVE_API_URL}/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Drive delete error:', error);
    return false;
  }
};
