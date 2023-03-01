// src/base/utils/async.ts
function _async(callback) {
  return new Promise(async (resolve, reject) => {
    try {
      await callback({ resolve, reject });
    } catch (err) {
      reject(err);
    }
  });
}
export {
  _async
};
