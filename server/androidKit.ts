import zlib from 'zlib';

function crc32(buf: Buffer): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ -1) >>> 0;
}

export function createZipBuffer(files: { name: string; content: string | Buffer }[]): Buffer {
  const localChunks: Buffer[] = [];
  const centralChunks: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf-8');
    const dataBuf = typeof file.content === 'string' ? Buffer.from(file.content, 'utf-8') : file.content;
    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = crc32(dataBuf);

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(8, 8); // compression method: deflate
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(dataBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra len

    localChunks.push(localHeader, nameBuf, compressed);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(dataBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralChunks.push(centralHeader, nameBuf);

    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralChunks);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDir.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDir, endRecord]);
}

export function buildAndroidStudioKit(siteUrl: string): Buffer {
  const cleanUrl = siteUrl.replace(/\/+$/, '');
  const host = cleanUrl.replace(/^https?:\/\//, '');

  const twaManifest = JSON.stringify(
    {
      packageId: 'in.updatebihar.app',
      host,
      name: 'UPDATE BIHAR',
      launcherName: 'UpdateBihar',
      display: 'standalone',
      themeColor: '#0B1B3D',
      navigationColor: '#0B1B3D',
      backgroundColor: '#0B1B3D',
      enableNotifications: true,
      startUrl: '/?source=twa',
      iconUrl: `${cleanUrl}/pwa-512x512.png`,
      maskableIconUrl: `${cleanUrl}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      signingKey: {
        path: './android.keystore',
        alias: 'updatebihar'
      },
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      generatorApp: 'bubblewrap-cli',
      webManifestUrl: `${cleanUrl}/manifest.json`
    },
    null,
    2
  );

  const mainActivityJava = `package in.updatebihar.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String PORTAL_URL = "${cleanUrl}";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains("${host}")) {
                    return false;
                }
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                return true;
            }
        });

        webView.loadUrl(PORTAL_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
`;

  const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.updatebihar.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="UPDATE BIHAR"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`;

  const buildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace 'in.updatebihar.app'
    compileSdk 34

    defaultConfig {
        applicationId "in.updatebihar.app"
        minSdk 23
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
}
`;

  const readmeTxt = `UPDATE BIHAR — Android APK Build Guide
=======================================
Live Website URL: ${cleanUrl}

Option 1 (Fastest — 1-Click APK without Android Studio):
1. Open https://www.pwabuilder.com/
2. Enter your website URL: ${cleanUrl}
3. Click "Package for Stores" -> "Android" -> "Download Package"
4. Inside the downloaded zip, you get the ready-to-install signed .apk file!

Option 2 (Using Bubblewrap CLI on Windows/Mac/Linux):
1. Install Node.js and run: npm i -g @bubblewrap/cli
2. In this folder run: bubblewrap update && bubblewrap build
3. It outputs app-release-signed.apk ready for Play Store or direct install!

Option 3 (Android Studio WebView Project):
- Open this folder in Android Studio (or copy MainActivity.java, AndroidManifest.xml, build.gradle into an empty Android Views project) and click Build -> Generate Signed Bundle / APK.
`;

  return createZipBuffer([
    { name: 'README_APK_BUILD.txt', content: readmeTxt },
    { name: 'twa-manifest.json', content: twaManifest },
    { name: 'app/build.gradle', content: buildGradle },
    { name: 'app/src/main/AndroidManifest.xml', content: androidManifestXml },
    { name: 'app/src/main/java/in/updatebihar/app/MainActivity.java', content: mainActivityJava }
  ]);
}
