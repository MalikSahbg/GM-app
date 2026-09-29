tasks.register("clean") {
    doLast {
        println("Cleaning build artifacts...")
        delete("dist")
    }
}

tasks.register("assembleDebug") {
    doLast {
        println("Compiling and verifying React Vite applet...")
        val isWindows = System.getProperty("os.name").lowercase().contains("windows")
        val npmCmd = if (isWindows) "npm.cmd" else "npm"
        val npxCmd = if (isWindows) "npx.cmd" else "npx"
        val buildProcess = ProcessBuilder(npmCmd, "run", "build")
            .redirectOutput(ProcessBuilder.Redirect.INHERIT)
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()
        val buildExit = buildProcess.waitFor()
        if (buildExit != 0) {
            throw GradleException("Vite compilation failed with exit code $buildExit")
        }
        println("Vite compilation succeeded! Syncing to Android...")
        val syncProcess = ProcessBuilder(npxCmd, "cap", "sync", "android")
            .redirectOutput(ProcessBuilder.Redirect.INHERIT)
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()
        syncProcess.waitFor()
        println("Capacitor Android sync completed!")
    }
}

tasks.register("lint") {
    doLast {
        println("Running TypeScript type check...")
        val isWindows = System.getProperty("os.name").lowercase().contains("windows")
        val npxCmd = if (isWindows) "npx.cmd" else "npx"
        val process = ProcessBuilder(npxCmd, "tsc", "--noEmit")
            .redirectOutput(ProcessBuilder.Redirect.INHERIT)
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()
        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw GradleException("TypeScript type check failed with exit code $exitCode")
        }
        println("TypeScript check succeeded!")
    }
}

