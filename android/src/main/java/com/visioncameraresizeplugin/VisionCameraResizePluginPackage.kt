package com.VisionCameraTransformPlugin

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class VisionCameraTransformPluginPackage : TurboReactPackage() {
  companion object {
    init {
      FrameProcessorPluginRegistry.addFrameProcessorPlugin("transform") { proxy, _ ->
        TransformPlugin(proxy)
      }
    }
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      return@ReactModuleInfoProvider emptyMap<String, ReactModuleInfo>()
    }
  }
}
