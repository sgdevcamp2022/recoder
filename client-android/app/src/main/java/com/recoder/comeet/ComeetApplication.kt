package com.recoder.comeet

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import org.mediasoup.droid.MediasoupClient
import timber.log.Timber

@HiltAndroidApp
class ComeetApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        if (BuildConfig.DEBUG) {
            Timber.plant(CustomTimberTree())
        }

        MediasoupClient.initialize(applicationContext)
    }
}

class CustomTimberTree : Timber.DebugTree() {
    override fun createStackElementTag(element: StackTraceElement): String {
        return "[D]${element.fileName}:${element.lineNumber}"
    }
}