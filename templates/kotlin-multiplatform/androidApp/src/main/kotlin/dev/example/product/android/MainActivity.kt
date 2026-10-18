package dev.example.product.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import dev.example.product.feature.WorkItemController
import dev.example.product.sample.sampleWorkItemController

class MainActivity : ComponentActivity() {
    private lateinit var controller: WorkItemController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        controller = sampleWorkItemController()
        setContent { MaterialTheme { WorkItemRoute(controller) } }
    }

    override fun onDestroy() {
        controller.close()
        super.onDestroy()
    }
}
