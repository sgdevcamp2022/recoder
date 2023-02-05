package com.recoder.comeet

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class ComeetApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        if (BuildConfig.DEBUG) {
            Timber.plant(CustomTimberTree())
        }
    }
}

class CustomTimberTree : Timber.DebugTree() {
    override fun createStackElementTag(element: StackTraceElement): String {
        return "${element.fileName}:${element.lineNumber}"
    }
}