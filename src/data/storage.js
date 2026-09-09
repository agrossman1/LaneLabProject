(function attachLaneLabStorage(root) {
  function get(storage = root.localStorage) {
    try { return storage; } catch (error) { return null; }
  }

  function read(key, fallback = null, storage = get()) {
    try { return storage?.getItem(key) ?? fallback; } catch (error) { return fallback; }
  }

  function write(key, value, storage = get()) {
    try { storage?.setItem(key, value); return true; } catch (error) { return false; }
  }

  function remove(key, storage = get()) {
    try { storage?.removeItem(key); return true; } catch (error) { return false; }
  }

  function clear(storage = get()) {
    try { storage?.clear(); return true; } catch (error) { return false; }
  }

  root.LaneLabStorage = Object.freeze({ get, read, write, remove, clear });
})(window);
