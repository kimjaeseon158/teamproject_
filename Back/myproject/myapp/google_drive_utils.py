import requests
import json
import io

class GoogleDriveService:
    """
    구글 드라이브 API 연동을 위한 유틸리티 클래스입니다.
    폴더 생성, 파일 검색, 다운로드 및 업로드(덮어쓰기 포함) 기능을 제공합니다.
    """
    API_URL = "https://www.googleapis.com/drive/v3/files"
    UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

    def __init__(self, access_token):
        self.headers = {"Authorization": f"Bearer {access_token}"}

    def get_or_create_folder(self, folder_name, parent_id=None):
        """특정 폴더를 찾고, 없으면 생성하여 ID를 반환합니다."""
        query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        params = {"q": query, "fields": "files(id, name)", "pageSize": 1}
        res = requests.get(self.API_URL, headers=self.headers, params=params)
        files = res.json().get("files", [])

        if files:
            return files[0]["id"]

        # 폴더가 없으면 생성
        metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder"
        }
        if parent_id:
            metadata["parents"] = [parent_id]
        
        create_res = requests.post(
            self.API_URL,
            headers={**self.headers, "Content-Type": "application/json"},
            data=json.dumps(metadata)
        )
        return create_res.json().get("id")

    def get_folder_path_id(self, path_list):
        """계층적 폴더 경로(리스트)를 따라 최종 폴더 ID를 반환합니다. (없으면 생성)"""
        current_parent = None
        for folder_name in path_list:
            current_parent = self.get_or_create_folder(folder_name, current_parent)
        return current_parent

    def find_file(self, filename, parent_id):
        """특정 폴더 내에서 파일을 찾아 ID를 반환합니다."""
        query = f"name = '{filename}' and '{parent_id}' in parents and trashed = false"
        params = {"q": query, "fields": "files(id, name)", "pageSize": 1}
        res = requests.get(self.API_URL, headers=self.headers, params=params)
        files = res.json().get("files", [])
        return files[0]["id"] if files else None

    def download_file(self, file_id):
        """파일을 다운로드하여 BytesIO 객체로 반환합니다."""
        download_url = f"{self.API_URL}/{file_id}?alt=media"
        res = requests.get(download_url, headers=self.headers)
        if res.status_code == 200:
            return io.BytesIO(res.content)
        return None

    def upload_or_update_file(self, file_io, filename, folder_id):
        """
        파일을 업로드합니다. 동일한 이름의 파일이 이미 존재하면 덮어씁니다(patch).
        """
        # 1. 기존 파일 검색
        existing_file_id = self.find_file(filename, folder_id)
        
        file_io.seek(0)
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        if existing_file_id:
            # 2. 파일 업데이트 (PATCH)
            update_url = f"{self.UPLOAD_URL}/{existing_file_id}?uploadType=multipart"
            files_data = {
                "metadata": ("metadata", json.dumps({"name": filename}), "application/json; charset=UTF-8"),
                "file": (filename, file_io.getvalue(), mime_type)
            }
            res = requests.patch(self.headers_without_content_type(), url=update_url, files=files_data)
        else:
            # 3. 파일 신규 생성 (POST)
            upload_url = f"{self.UPLOAD_URL}?uploadType=multipart"
            metadata = {"name": filename, "parents": [folder_id]}
            files_data = {
                "metadata": ("metadata", json.dumps(metadata), "application/json; charset=UTF-8"),
                "file": (filename, file_io.getvalue(), mime_type)
            }
            res = requests.post(self.headers_without_content_type(), url=upload_url, files=files_data)
            
        return res.json()

    def headers_without_content_type(self):
        """Multipart 요청 시 requests가 Content-Type을 직접 설정하도록 헤더에서 제거합니다."""
        return {k: v for k, v in self.headers.items() if k.lower() != 'content-type'}
