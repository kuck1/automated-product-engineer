import Foundation

public actor IdentityScopedCache<Value: Sendable> {
    private var identity: String?
    private var values: [String: Value] = [:]

    public init() {}

    public func transition(to nextIdentity: String?) {
        guard nextIdentity != identity else { return }
        identity = nextIdentity
        values.removeAll()
    }

    public func store(_ value: Value, for key: String, identity expectedIdentity: String) {
        guard identity == expectedIdentity else { return }
        values[key] = value
    }

    public func value(for key: String, identity expectedIdentity: String) -> Value? {
        guard identity == expectedIdentity else { return nil }
        return values[key]
    }
}
