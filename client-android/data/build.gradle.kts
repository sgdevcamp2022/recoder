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
    implementation(Libraries.DATA_LIBRARIES)
//    annotationProcessor(AnnotationProcessors.DATA_LIBRARIES)
    kapt(Kapt.DATA_LIBRARIES)
    implementation(TestImpl.TEST_LIBRARIES)
    implementation(TestImpl.ANDROID_TEST_LIBRARIES)

}

kapt {
    correctErrorTypes = true
}