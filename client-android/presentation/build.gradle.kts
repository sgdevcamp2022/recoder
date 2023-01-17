plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    kotlin("kapt")
}

android {
    namespace = "com.recoder.presentation"
    compileSdk = Configurations.compileSdk

    defaultConfig {
        minSdk = Configurations.minSdk
        targetSdk = Configurations.targetSdk

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        buildTypes {
            getByName("release") {
                isMinifyEnabled = false
                proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        dataBinding = true
        viewBinding = true
    }
}

dependencies {
    implementation(project(":domain"))
    implementation("com.google.android.material:material:1.4.+")
    implementation("androidx.appcompat:appcompat:1.4.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.3")
    implementation("androidx.navigation:navigation-fragment-ktx:2.4.1")
    implementation("androidx.navigation:navigation-ui-ktx:2.4.1")
    implementation("androidx.coordinatorlayout:coordinatorlayout:1.2.0")

    implementation(Libraries.VIEW_LIBRARIES)
    kapt(Kapt.VIEW_LIBRARIES)
    debugImplementation(DebugImpl.VIEW_LIBRARIES)
    androidTestImplementation(AndroidTestImpl.VIEW_LIBRARIES)
}
