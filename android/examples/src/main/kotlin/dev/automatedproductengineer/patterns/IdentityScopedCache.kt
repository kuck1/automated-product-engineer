package dev.automatedproductengineer.patterns

class IdentityScopedCache<T> {
    private var subjectId: String? = null
    private val values = mutableMapOf<String, T>()

    @Synchronized
    fun activate(nextSubjectId: String) {
        if (subjectId != nextSubjectId) values.clear()
        subjectId = nextSubjectId
    }

    @Synchronized
    fun put(activeSubjectId: String, key: String, value: T) {
        check(subjectId == activeSubjectId) { "Cache subject changed before write" }
        values[key] = value
    }

    @Synchronized
    fun get(activeSubjectId: String, key: String): T? {
        if (subjectId != activeSubjectId) return null
        return values[key]
    }

    @Synchronized
    fun clear() {
        values.clear()
        subjectId = null
    }
}
