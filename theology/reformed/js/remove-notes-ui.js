/* Remove the deprecated research memo surface from the public UI. */
(function () {
  function stripMemoCount() {
    var countbar = document.getElementById("countbar");
    if (!countbar) return;
    countbar.innerHTML = countbar.innerHTML.replace(/\s*<span class="sep">·<\/span>\s*<b>\d+<\/b>\s*메모/g, "");
  }
  stripMemoCount();
  document.addEventListener("DOMContentLoaded", stripMemoCount);
})();
