# iOS shell integration

Create or retain the real Xcode application project in this directory, add the Swift sources, and link `ProductKernel` through Kotlin's direct-integration build phase:

```sh
if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then exit 0; fi
cd "$SRCROOT/.."
./gradlew :shared:product-kernel:embedAndSignAppleFrameworkForXcode
```

Do not place signing teams, bundle identifiers, or credentials in the reference template. The application composition root constructs native secure-storage, identity, telemetry, database, and transport adapters and creates the shared controller.
