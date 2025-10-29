import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const WEBSITE_URL = 'http://bishwavromonoverseaseltd.free.nf/';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate a resource loading delay (e.g., fetching data, checking auth)
        // This is where you would put any async initialization logic
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // Only hide the native splash screen when the app logic is ready, the Lottie animation is finished,
    // AND the WebView has loaded its content.
    if (appIsReady && animationFinished && webViewLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, animationFinished, webViewLoaded]);

  const handleAnimationFinish = () => {
    setAnimationFinished(true);
  };

  const handleWebViewLoad = () => {
    setWebViewLoaded(true);
  };

  // Phase 1: Native Splash Screen is still visible, showing Lottie animation
  if (!appIsReady) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar hidden={true} />
        {/* Lottie animation for the initial splash screen */}
        <LottieView
          source={require('./assets/splash_animation.json')} // We will create this file
          autoPlay
          loop={false} // Run once
          style={styles.lottie}
          onAnimationFinish={handleAnimationFinish}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Phase 2: App logic is ready, showing WebView and a persistent loading overlay
  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        onLoad={handleWebViewLoad}
        // Optional: Add a custom loading indicator while the WebView loads
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        // Inject a custom style to potentially make the website look better on mobile
        injectedJavaScript={`
          const style = document.createElement('style');
          style.innerHTML = 'body { padding-top: 0 !important; }';
          document.head.appendChild(style);
          true;
        `}
      />
      {/* Show a persistent loading screen until both Lottie animation and WebView are ready */}
      {(!animationFinished || !webViewLoaded) && (
        <View style={styles.loadingOverlayAbsolute}>
          {/* Lottie animation for persistent loading */}
          <LottieView
            source={require('./assets/splash_animation.json')}
            autoPlay
            loop={true} // Loop while waiting
            style={styles.lottie}
            resizeMode="cover"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  lottie: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlayAbsolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it's on top of the WebView
  },
});
