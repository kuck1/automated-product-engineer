// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ProductEngineeringPatterns",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "ProductEngineeringPatterns", targets: ["ProductEngineeringPatterns"])],
    targets: [
        .target(name: "ProductEngineeringPatterns"),
        .testTarget(name: "ProductEngineeringPatternsTests", dependencies: ["ProductEngineeringPatterns"]),
    ]
)
