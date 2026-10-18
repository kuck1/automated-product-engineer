plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.android.kmp.library)
}

kotlin {
    androidLibrary {
        namespace = "dev.example.product.kernel"
        compileSdk = 37
        minSdk = 26
    }
    jvm("host")
    val appleTargets = listOf(iosArm64(), iosSimulatorArm64(), iosX64())
    appleTargets.forEach { target ->
        target.binaries.framework {
            baseName = "ProductKernel"
            isStatic = true
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
            implementation(libs.kotlinx.coroutines.test)
        }
    }
}
