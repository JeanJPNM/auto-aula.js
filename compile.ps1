$entry_point = "build/main.js"
$name = "auto-aula"
$targets = @("windows", "macos");
foreach ($target in $targets) {
  nexe $entry_point -o bin/$name-$target
  nexe $entry_point -o bin/$name-$target-x86
}