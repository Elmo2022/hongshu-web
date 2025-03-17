<template>
  <div class="video-upload-container">
    <template v-if="videoUrl">
      <div class="header">
        <div class="header-left">
          <span class="header-icon"></span>
          <span class="header-title">发布视频</span>
        </div>
        <div class="header-right">
          <div class="action-buttons">
            <el-upload
              class="replace-upload"
              action=""
              :show-file-list="false"
              :headers="uploadHeader"
              :before-upload="beforeVideoUpload"
              :on-change="handleVideoChange"
              accept="video/*"
            >
              <el-button type="danger" link>
                <el-icon><RefreshRight /></el-icon>
                替换视频
              </el-button>
            </el-upload>
            <el-button type="danger" link @click="handleClear">
              <el-icon><CloseBold /></el-icon>
              清空
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <!-- 视频预览区域 -->
    <div v-if="videoUrl" class="video-preview-container">
      <div class="video-content">
        <div class="video-wrapper">
          <video
            ref="videoRef"
            :src="videoUrl"
            class="uploaded-video"
            controls
            @loadeddata="handleVideoLoaded"
            preload="auto"
          ></video>
        </div>
      </div>
      
      <!-- 视频封面 -->
      <div class="cover-container">
        <div class="cover-title">视频封面</div>
        <div class="cover-content">
          <div class="cover-preview" v-if="coverUrl">
            <img :src="coverUrl" alt="视频封面" />
            <div class="cover-actions">
              <div class="action-buttons">
                <el-button type="danger" link @click.stop="handleCapture" class="action-btn">
                  <el-icon><RefreshLeft /></el-icon>
                  重新截取
                </el-button>
                <el-upload
                  class="cover-upload"
                  action=""
                  :show-file-list="false"
                  :headers="uploadHeader"
                  :before-upload="beforeCoverUpload"
                  :on-change="handleCoverChange"
                >
                  <el-button type="danger" link class="action-btn">
                    <el-icon><Upload /></el-icon>
                    上传封面
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
          <div v-else class="cover-empty">
            <div class="loading-cover">正在生成封面...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频上传区域 -->
    <div class="video-upload-area" v-if="!videoUrl">
      <el-upload
        class="video-uploader"
        action=""
        :limit="1"
        :headers="uploadHeader"
        :before-upload="beforeVideoUpload"
        :on-change="handleVideoChange"
        :auto-upload="false"
        accept="video/*"
        drag
      >
        <div class="upload-placeholder">
          <div class="upload-icon">
            <img
              src="//fe-static.xhscdn.com/formula-static/ugc/public/img/upload-large.e52d3e7.png"
              alt="上传图标"
            />
          </div>
          <div class="upload-text">拖拽视频到此或点击上传</div>
          <el-button type="primary" class="upload-btn">上传视频</el-button>
        </div>
      </el-upload>

      <!-- 上传说明 -->
      <div class="upload-info">
        <div class="info-item">
          <h4>视频大小</h4>
          <p>支持时长60分钟以内，最大20GB的视频文件</p>
        </div>
        <div class="vertical-divider"></div>
        <div class="info-item">
          <h4>视频格式</h4>
          <p>支持常用视频格式，推荐使用mp4、mov</p>
        </div>
        <div class="vertical-divider"></div>
        <div class="info-item">
          <h4>视频分辨率</h4>
          <p>推荐上传720P（1280*720）及以上视频，超过1080P的视频用网页上传画质更清晰</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { CloseBold, RefreshLeft, RefreshRight, Upload } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
  videoUrl: {
    type: String,
    default: ''
  },
  coverUrl: {
    type: String,
    default: ''
  },
  uploadHeader: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:videoUrl', 'update:coverUrl']);

const videoRef = ref<HTMLVideoElement | null>(null);

// 视频上传前验证
const ALLOWED_VIDEO_FORMATS = ['video/mp4', 'video/quicktime']; // mov格式
const beforeVideoUpload = (file: File) => {
  const isValidFormat = ALLOWED_VIDEO_FORMATS.includes(file.type);
  if (!isValidFormat) {
    ElMessage.error('请上传MP4或MOV格式的视频！');
    return false;
  }
  const isVideo = file.type.startsWith('video/');
  const isLt20GB = file.size / 1024 / 1024 / 1024 < 20;
  const duration = 60 * 60; // 60分钟
  if (!isVideo) {
    ElMessage.error('请上传视频文件！');
    return false;
  }
  if (!isLt20GB) {
    ElMessage.error('视频大小不能超过20GB！');
    return false;
  }
  // 创建临时video元素检查视频时长
  const video = document.createElement('video');
  video.preload = 'metadata';
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      if (video.duration > duration) {
        ElMessage.error('视频时长不能超过60分钟！');
        resolve(false);
      }
      resolve(true);
    };
    video.src = URL.createObjectURL(file);
  });
};

// 处理视频变更
const handleVideoChange = (file: any) => {
  if (file.raw) {
    // 清除旧的视频URL
    if (props.videoUrl && props.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(props.videoUrl);
    }
    const videoUrl = URL.createObjectURL(file.raw);
    emit('update:videoUrl', videoUrl);
    // 重置封面，等待视频加载完成后自动截取
    emit('update:coverUrl', '');
  }
};

// 视频加载完成后自动截取第一帧作为封面
const handleVideoLoaded = async () => {
  if (!videoRef.value) return;
  try {
    // 将视频跳转到第一帧
    videoRef.value.currentTime = 0;
    // 等待视频真正跳转完成
    await new Promise((resolve) => {
      videoRef.value!.onseeked = resolve;
    });
    // 截取第一帧作为封面
    handleCapture();
  } catch (error) {
    // console.error('Error capturing video frame:', error);
  }
};

// 截取视频当前帧作为封面
const handleCapture = () => {
  if (!videoRef.value) return;
  const video = videoRef.value;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const coverUrl = canvas.toDataURL('image/jpeg', 0.8);
    emit('update:coverUrl', coverUrl);
  } catch (error) {
    // console.error('Error capturing video frame:', error);
    ElMessage.error('封面截取失败，请重试');
  }
};

// 封面图片上传前验证
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error('封面只能是图片格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 处理封面图片变更
const handleCoverChange = (file: any) => {
  if (file.raw) {
    const coverUrl = URL.createObjectURL(file.raw);
    emit('update:coverUrl', coverUrl);
  }
};

// 清空视频和封面
const handleClear = () => {
  ElMessageBox.confirm("将会清空已上传的视频，是否继续？", "提示", {
    confirmButtonText: "重新上传",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger",
  })
  .then(() => {
    if (props.videoUrl && props.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(props.videoUrl);
    }
    emit('update:videoUrl', '');
    emit('update:coverUrl', '');
    if (videoRef.value) {
      videoRef.value.onseeked = null;
    }
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
    });
};

const reset = () => {
  // 使用 emit 更新父组件的值
  emit('update:videoUrl', '');
  emit('update:coverUrl', '');
  if (videoRef.value) {
    videoRef.value.src = '';
  }
};

// 暴露方法
defineExpose({
  reset
});

// 添加资源清理
onBeforeUnmount(() => {
  if (props.videoUrl && props.videoUrl.startsWith('blob:')) {
    URL.revokeObjectURL(props.videoUrl);
  }
  if (props.coverUrl && props.coverUrl.startsWith('blob:')) {
    URL.revokeObjectURL(props.coverUrl);
  }
});
</script>

<style lang="less" scoped>
.video-upload-container {
  .video-upload-area {
    background: #fff;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;

    :deep(.el-upload) {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        height: auto;
        padding: 80px 0;
        transition: border-color 0.3s;

        &:hover {
          border-color: #ff2442;
        }
      }

      .el-upload-dragger.is-dragover {
        border-color: #ff2442;
        background-color: rgba(255, 36, 66, 0.06);
      }
    }

    .upload-placeholder {
      padding: 40px 0;

      .upload-icon {
        margin-bottom: 16px;
        img {
          width: 100px;
          height: 64px;
        }
      }

      .upload-text {
        color: #909399;
        font-size: 14px;
        margin-bottom: 16px;
      }

      .upload-btn {
        padding: 9px 23px;
        font-size: 14px;
        border-radius: 4px;
        background-color: #ff2442;
        border-color: #ff2442;

        &:hover {
          background-color: #ff3a3a;
          border-color: #ff3a3a;
        }
      }
    }

    .upload-info {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      padding: 0 40px;
      align-items: stretch;
      gap: 20px;

      .vertical-divider {
        width: 0;
        border-left: 1px dashed #dcdfe6;
      }

      .info-item {
        text-align: left;
        flex: 1;

        h4 {
          font-size: 14px;
          color: #333;
          margin-bottom: 8px;
        }

        p {
          font-size: 12px;
          color: #909399;
          line-height: 1.5;
          max-width: 200px;
        }
      }
    }
  }

  .video-preview-container {
    padding: 10px;
    position: relative;

    .video-content {
      width: 100%;
      display: flex;
      margin-left: 20px;

      .video-wrapper {
        flex: 1;

        .uploaded-video {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
        }
      }
    }
  }

  .header {
    display: flex;
    padding: 15px 20px;
    line-height: 2px;
    font-size: 16px;
    font-weight: 400;

    .header-left {
      align-items: center;

      .header-icon {
        position: relative;
        top: 2px;
        display: inline-block;
        width: 6px;
        height: 16px;
        background: #ff3a3a;
        border-radius: 3px;
        margin-right: 3px;
      }
    }

    .header-right {
      margin-left: auto;
      align-items: center;

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.el-upload) {
          display: block;
        }

        .el-button {
          display: flex;
          align-items: center;

          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .cover-container {
    margin: 10px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #eee;

    .cover-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .cover-content {
      margin-left: 1vw;

      .cover-preview {
        display: flex;
        align-items: flex-start;

        img {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
        }

        .cover-actions {
          display: flex;
          gap: 8px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          margin-top: 18px;
          margin-left: 18px;
          gap: 10px;

          .action-btn {
            width: 100px;
          }

          :deep(.el-upload) {
            display: block;

            .el-button {
              width: 100px;
            }
          }
        }
      }

      .cover-empty {
        display: flex;
        gap: 8px;

        .loading-cover {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
}

/* 按钮悬浮效果 */
.el-button.el-button--danger.is-link {
  transition: all 0.3s ease;

  &:hover {
    color: #ff4d4f !important;
    transform: scale(1.1);
  }
}

/* 上传按钮悬浮效果 */
.upload-btn {
  transition: all 0.3s ease !important;

  &:hover {
    transform: scale(1.05);
  }
}
</style>