package com.recoder.comeet

import android.app.Application
import timber.log.Timber

class ComeetApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
    }
}
