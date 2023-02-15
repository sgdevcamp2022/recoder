plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    kotlin("kapt")
    id("dagger.hilt.android.plugin")
}

android {
    namespace = "com.recoder.comeet"
    compileSdk = Configurations.compileSdk

    defaultConfig {
        applicationId = "com.recoder.comeet"
        minSdk = Configurations.minSdk
        targetSdk = Configurations.targetSdk
        versionCode = Configurations.versionCode
        versionName = Configurations.versionName
        multiDexEnabled = true

//        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = true // Enables code shrinking for the release build type.
            proguardFiles(
                getDefaultProguardFile("proguard-android.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = Configurations.jvmTarget
    }
    buildFeatures {
        dataBinding = true
    }
    packagingOptions {
        resources.excludes.add("META-INF/LICENSE*")
        exclude("META-INF/NOTICE")
        exclude("META-INF/LICENSE")
        exclude("META-INF/DEPENDENCIES")
        exclude("META-INF/ASL2.0")
        exclude("META-INF/DEPENDENCIES.txt")

        exclude("META-INF/LICENSE.txt")
        exclude("META-INF/NOTICE.txt")
        exclude("META-INF/notice.txt")
        exclude("META-INF/license.txt")
        exclude("META-INF/LGPL2.1")
    }
}

dependencies {
    implementation(project(":domain"))
    implementation(project(":presentation"))
    implementation(project(":data"))

    kapt(Kapt.APP_LIBRARIES)
    implementation(Libraries.APP_LIBRARIES)
}