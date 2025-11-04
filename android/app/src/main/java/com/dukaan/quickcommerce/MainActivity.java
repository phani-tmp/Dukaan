package com.dukaan.quickcommerce;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
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
}
