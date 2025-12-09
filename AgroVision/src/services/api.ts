// src/services/api.ts
import { Platform } from "react-native";

//
// IMPORTANT: set API_BASE_URL below before running on a real device.
// - If you're using Android emulator (default Android Studio AVD) use 10.0.2.2
// - If you're using a physical Android device, replace 192.168.1.42 with your Mac's LAN IP
//   (run: `ipconfig getifaddr en0` on macOS to get it).
//
export const API_BASE_URL =
  Platform.OS === "android" ? "http://localhost:3030" : "http://localhost:3030";
// If using a real phone, change the above to: "http://<YOUR_MAC_IP>:3030"

export async function uploadImage(fileUri: string) {
  const filename = fileUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;

  const form = new FormData();
  // @ts-ignore - RN FormData file shape
  form.append("file", {
    uri: fileUri,
    name: filename,
    type: mime,
  });

  const res = await fetch(`${API_BASE_URL}/api/v1/predict`, {
    method: "POST",
    body: form,
    headers: {
      // letting fetch set the correct multipart boundary is usually fine,
      // but include this header if your environment requires it:
      "Content-Type": "multipart/form-data",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}