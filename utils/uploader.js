const requestUrl = 'https://fileapi.beefast.net/api/file/upload'

export default async function uploadFile(filePath, uploadPath = '/GoodsPics/', customFileName = '') {

  //var maxChunkRetries = 3; //  并发上传数，默认 3
  const chunkSize = 1024 * 1024;//切片大小

  // 所有请求
  const requests= [];

  return new Promise(async (resolve, reject) => {
    try {
      wx.getFileInfo({filePath, async success(res) {
          const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
          const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
          const upLoadInfo = {};

          upLoadInfo.identifier   = res.digest;//md5码
          upLoadInfo.filePath     = uploadPath;
          upLoadInfo.isDir        = 0;
          upLoadInfo.filename     = customFileName || fileName;//文件名
          upLoadInfo.relativePath = fileName;// 文件名
          upLoadInfo.extendName   = fileExt;//扩展名
          upLoadInfo.totalSize    = res.size;//总大小
          upLoadInfo.chunkSize    = chunkSize;//切片大小
          upLoadInfo.totalChunks  = Math.ceil(upLoadInfo.totalSize / upLoadInfo.chunkSize);//所有切片
        
          for (let _chunks = 1; upLoadInfo.totalChunks >= _chunks; _chunks++) {
            let now = JSON.parse(JSON.stringify(upLoadInfo));
            if (upLoadInfo.totalChunks > _chunks) {
              now.currentChunkSize = chunkSize;
            }else {
              now.currentChunkSize = upLoadInfo.totalSize - ((_chunks - 1) * upLoadInfo.chunkSize);//当前切片大小
            }
            now.chunkNumber = _chunks;

            let start = (_chunks-1) * upLoadInfo.chunkSize;
            let end = Math.min(upLoadInfo.totalSize, start + upLoadInfo.chunkSize);
            let buffer = wx.getFileSystemManager().readFileSync(filePath);
            now.files = buffer.slice(start, end);
            requests.push(doUploadFile(now, filePath))
          }

          const results = await Promise.all(requests)
          //console.log(results)
          if (results.length === 0) {
            reject(new Error('没有获取到上传图片的ID'))
            return
          }
          for (let i = 0; i < results.length; i++) {
            const r = results[i]
            if (r && r.data && Array.isArray(r.data.upFileList) && r.data.upFileList.length > 0) {
              resolve(r)
              return
            }
          }
          reject(new Error('没有获取到上传图片的ID'))
        },
        fail() {
          reject(new Error('文件信息解析失败'))
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function doUploadFile(upLoadData, filePath) {
  var fd = {};
  Object.keys(upLoadData).forEach((key) => {
    fd[key] = upLoadData[key];
  });
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: requestUrl,
      filePath: filePath,
      formData: fd,
      name: 'files',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      success(res) {
        try {
          const resultData = JSON.parse(res.data)
          //console.log(resultData)
          resolve(resultData)
        } catch {
          reject(new Error('解析返回数据错误'))
        }
      },
      fail() {
        reject()
      }
    })
  })
}
