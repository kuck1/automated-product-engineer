import SwiftUI

enum ProductSpacing { static let compact: CGFloat = 8; static let standard: CGFloat = 16; static let section: CGFloat = 24 }

enum ProductColor {
    static let accent: Color = .accentColor
    static let success: Color = .green
    static let warning: Color = .orange
    static let critical: Color = .red
}

struct StatusLabel: View {
    enum Kind { case queued, syncing, confirmed, conflicted }
    let kind: Kind

    var body: some View {
        Label(title, systemImage: symbol)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(color)
            .accessibilityLabel(accessibilityText)
    }

    private var title: String { switch kind { case .queued: "Saved on this device"; case .syncing: "Syncing"; case .confirmed: "Confirmed"; case .conflicted: "Needs review" } }
    private var symbol: String { switch kind { case .queued: "tray.and.arrow.down"; case .syncing: "arrow.triangle.2.circlepath"; case .confirmed: "checkmark.circle"; case .conflicted: "exclamationmark.triangle" } }
    private var color: Color { switch kind { case .queued, .syncing: ProductColor.warning; case .confirmed: ProductColor.success; case .conflicted: ProductColor.critical } }
    private var accessibilityText: String { title }
}
