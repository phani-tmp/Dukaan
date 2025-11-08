package com.dukaan.quickcommerce;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int RECORD_AUDIO_PERMISSION_REQUEST_CODE = 1;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Check and request microphone permission
        if (isRecordAudioPermissionGranted()) {
            // Permission is already granted
        } else {
            requestRecordAudioPermission();
        }

        // Configure WebView for Firebase reCAPTCHA support
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript (already enabled by Capacitor, but explicit)
        webSettings.setJavaScriptEnabled(true);
        
        // Enable DOM storage for Firebase
        webSettings.setDomStorageEnabled(true);
        
        // Enable database storage
        webSettings.setDatabaseEnabled(true);
        
        // Enable mixed content for reCAPTCHA
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Allow third-party cookies (required for reCAPTCHA)
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        
        // Enable caching
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // User agent string (helps with reCAPTCHA detection)
        webSettings.setUserAgentString(webSettings.getUserAgentString() + " DukaanApp/1.0");
    }

    private boolean isRecordAudioPermissionGranted() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestRecordAudioPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, RECORD_AUDIO_PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == RECORD_AUDIO_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission was granted
            } else {
                // Permission was denied
            }
        }
    }
}
