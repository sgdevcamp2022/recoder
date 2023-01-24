plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    kotlin("kapt")
}

android {
    namespace = "com.recoder.data"
    compileSdk = Configurations.compileSdk

    defaultConfig {
        minSdk = Configurations.minSdk
        targetSdk = Configurations.targetSdk

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = Configurations.jvmTarget
    }
}

dependencies {

    implementation(project(":domain"))
//    implementation "androidx.core:core-ktx:1.7.0"
//    implementation "androidx.appcompat:appcompat:1.5.1"
//    implementation "com.google.android.material:material:1.7.0"
//    testImplementation "junit:junit:4.13.2"
//    androidTestImplementation "androidx.test.ext:junit:1.1.5"
//    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
}

kapt {
    correctErrorTypes = true
}