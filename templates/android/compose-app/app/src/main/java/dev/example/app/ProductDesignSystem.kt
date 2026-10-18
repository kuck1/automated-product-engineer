package dev.example.app

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class ProductSpacing(
    val controlGap: Dp = 12.dp,
    val sectionGap: Dp = 24.dp,
    val page: Dp = 24.dp,
)

@Immutable
data class ProductColors(
    val success: Color,
    val warning: Color,
    val queued: Color,
)

private val LocalProductSpacing = staticCompositionLocalOf { ProductSpacing() }
private val LocalProductColors = staticCompositionLocalOf {
    ProductColors(Color(0xFF1B7F69), Color(0xFF8A5A00), Color(0xFF6553C7))
}

object ProductTheme {
    val spacing: ProductSpacing @Composable get() = LocalProductSpacing.current
    val colors: ProductColors @Composable get() = LocalProductColors.current
}

@Composable
fun ProductAppTheme(
    colorScheme: ColorScheme,
    spacing: ProductSpacing = ProductSpacing(),
    productColors: ProductColors = ProductColors(
        success = Color(0xFF1B7F69),
        warning = Color(0xFF8A5A00),
        queued = Color(0xFF6553C7),
    ),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(
        LocalProductSpacing provides spacing,
        LocalProductColors provides productColors,
    ) {
        MaterialTheme(colorScheme = colorScheme, content = content)
    }
}
