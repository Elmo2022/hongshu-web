<template>
  <div class="container" id="container">
    <div v-if="isLogin" class="push-container">
      <!-- 标签切换 -->
      <div class="tab-container" v-if="!fileList.length && !videoUrl">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: currentTab === tab.key }]"
          @click="handleTabChange(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 上传图片 -->
      <template v-if="currentTab === 'image'">
        <!-- 未上传图片时显示的界面 -->
        <template v-if="fileList.length === 0">
          <div class="image-upload-area">
            <el-upload
              v-model:file-list="fileList"
              class="image-uploader"
              action=""
              :limit="9"
              :headers="uploadHeader"
              :auto-upload="false"
              :on-change="handleImageChange"
              multiple
              drag
            >
              <div class="upload-placeholder">
                <div class="upload-icon">
                  <img
                    src="//fe-static.xhscdn.com/formula-static/ugc/public/img/upload-large.e52d3e7.png"
                    alt="上传图标"
                  />
                </div>
                <div class="upload-text">拖拽图片到此或点击上传</div>
                <div class="upload-tip">(最多支持上传9张)</div>
                <el-button type="primary" class="upload-btn">上传图片</el-button>
              </div>
            </el-upload>
            <!-- 上传说明 -->
            <div class="upload-info">
              <div class="info-item">
                <h4>图片大小</h4>
                <p>支持上传的图片大小，最大20MB的图片文件</p>
              </div>
              <div class="vertical-divider"></div>
              <div class="info-item">
                <h4>图片格式</h4>
                <p>支持上传的图片格式，推荐使用png、jpg、jpeg、webp，不支持gif、live及其转化后的图片</p>
              </div>
              <div class="vertical-divider"></div>
              <div class="info-item">
                <h4>图片分辨率</h4>
                <p>推荐上传高比为3.4、分辨率不低于720*960的照片，超过1280P的图片用网页上传画质更清晰</p>
              </div>
            </div>
          </div>
        </template>
        <!-- 上传后显示的界面保持原样 -->
        <template v-else>
          <div class="header">
            <div class="header-left">
              <span class="header-icon"> </span>
              <span class="header-title">发布图文</span>
              <span class="image-count">({{ fileList.length }}/{{ maxImageCount }})</span>
            </div>
            <div class="header-right">
              <el-button type="danger" link @click="handleClearAndReupload">
                <el-icon> <RefreshRight /></el-icon>
                清空并重新上传
              </el-button>
            </div>
          </div>
          <div class="img-list">
            <el-upload
              v-model:file-list="fileList"
              class="image-uploader"
              action=""
              list-type="picture-card"
              :limit="maxImageCount"
              :headers="uploadHeader"
              :auto-upload="false"
              :on-change="handleImageChange"
              :on-preview="handlePreview"
              :on-exceed="handleExceed"
              multiple
              drag
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
            <el-dialog v-model="dialogVisible" title="图片预览" width="30%" :style="{ marginTop: '15vh' }" center>
              <img :src="dialogImageUrl" alt="Preview Image" class="preview-image" />
            </el-dialog>
          </div>
          <!-- 封面图显示区域 -->
          <div class="cover-container">
            <div class="cover-title">封面图</div>
            <div class="cover-content">
              <div class="cover-preview">
                <img :src="fileList[0]?.url" alt="封面图" class="cover-image"/>
                <div class="cover-actions">
                  <el-button 
                    type="danger" 
                    link 
                    @click="handleChangeCover" 
                    v-if="fileList.length > 1"
                  >
                    <el-icon><RefreshLeft /></el-icon>
                    更换封面
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- 添加封面选择对话框 -->
          <el-dialog
            v-model="coverDialogVisible"
            title="选择封面图"
            width="50%"
            :close-on-click-modal="false"
          >
            <div class="cover-selector">
              <div 
                v-for="(item, index) in fileList" 
                :key="index"
                class="cover-option"
                :class="{ active: index === 0 }"
                @click="setCoverImage(index)"
              >
                <img :src="item.url" :alt="`图片${index + 1}`"/>
                <div class="cover-mask">
                  <el-icon v-if="index === 0"><Check /></el-icon>
                </div>
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="coverDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="coverDialogVisible = false">
                  确定
                </el-button>
              </span>
            </template>
          </el-dialog>
        </template>
      </template>

      <!-- 上传视频 -->
      <template v-if="currentTab === 'video'">
        <template v-if="videoUrl">
          <div class="header">
            <div class="header-left">
              <span class="header-icon"> </span>
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
                    <el-icon> <RefreshRight /></el-icon>
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
        <div class="video-upload-container">
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
            <!-- 添加封面图部分 -->
            <div class="cover-container">
              <div class="cover-title">视频封面</div>
              <div class="cover-content">
                <div class="cover-preview" v-if="coverUrl">
                  <img :src="coverUrl" alt="视频封面" />
                  <div class="cover-actions">
                    <div class="action-buttons">
                      <el-button size="small" type="danger" link @click.stop="handleCapture" class="action-btn">
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
                        <el-button size="small" type="danger" link class="action-btn">
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

      <!-- 发布闲置 -->
      <template v-if="currentTab === 'idle'">
        <!-- 未上传图片时显示的界面 -->
        <template v-if="fileList.length === 0">
          <div class="image-upload-area">
            <el-upload
              v-model:file-list="fileList"
              class="image-uploader"
              action=""
              :limit="9"
              :headers="uploadHeader"
              :auto-upload="false"
              :on-change="handleImageChange"
              multiple
              drag
            >
              <div class="upload-placeholder">
                <div class="upload-icon">
                  <img
                    src="//fe-static.xhscdn.com/formula-static/ugc/public/img/upload-large.e52d3e7.png"
                    alt="上传图标"
                  />
                </div>
                <div class="upload-text">拖拽图片到此或点击上传</div>
                <div class="upload-tip">(最多支持上传9张)</div>
                <el-button type="primary" class="upload-btn">上传图片</el-button>
              </div>
            </el-upload>
            <!-- 上传说明 -->
            <div class="upload-info">
              <div class="info-item">
                <h4>图片大小</h4>
                <p>支持上传的图片大小，最大20MB的图片文件</p>
              </div>
              <div class="vertical-divider"></div>
              <div class="info-item">
                <h4>图片格式</h4>
                <p>支持上传的图片格式，推荐使用png、jpg、jpeg、webp，不支持gif、live及其转化后的图片</p>
              </div>
              <div class="vertical-divider"></div>
              <div class="info-item">
                <h4>图片分辨率</h4>
                <p>推荐上传高比为3.4、分辨率不低于720*960的照片，超过1280P的图片用网页上传画质更清晰</p>
              </div>
            </div>
          </div>
        </template>
        <!-- 上传后显示的界面保持原样 -->
        <template v-else>
          <div class="header">
            <div class="header-left">
              <span class="header-icon"> </span>
              <span class="header-title">发布闲置</span>
              <span class="image-count">({{ fileList.length }}/{{ maxImageCount }})</span>
            </div>
            <div class="header-right">
              <el-button type="danger" link @click="handleClearAndReupload">
                <el-icon> <RefreshRight /></el-icon>
                清空并重新上传
              </el-button>
            </div>
          </div>
          <div class="img-list">
            <el-upload
              v-model:file-list="fileList"
              class="image-uploader"
              action=""
              list-type="picture-card"
              :limit="maxImageCount"
              :headers="uploadHeader"
              :auto-upload="false"
              :on-change="handleImageChange"
              :on-preview="handlePreview"
              :on-exceed="handleExceed"
              multiple
              drag
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
            <el-dialog v-model="dialogVisible" title="图片预览" width="30%" :style="{ marginTop: '15vh' }" center>
              <img :src="dialogImageUrl" alt="Preview Image" class="preview-image" />
            </el-dialog>
          </div>
          <!-- 封面图显示区域 -->
          <div class="cover-container">
            <div class="cover-title">封面图</div>
            <div class="cover-content">
              <div class="cover-preview">
                <img :src="fileList[0]?.url" alt="封面图" class="cover-image"/>
                <div class="cover-actions">
                  <el-button 
                    type="danger" 
                    link 
                    @click="handleChangeCover" 
                    v-if="fileList.length > 1"
                  >
                    <el-icon><RefreshLeft /></el-icon>
                    更换封面
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- 添加封面选择对话框 -->
          <el-dialog
            v-model="coverDialogVisible"
            title="选择封面图"
            width="50%"
            :close-on-click-modal="false"
          >
            <div class="cover-selector">
              <div 
                v-for="(item, index) in fileList" 
                :key="index"
                class="cover-option"
                :class="{ active: index === 0 }"
                @click="setCoverImage(index)"
              >
                <img :src="item.url" :alt="`图片${index + 1}`"/>
                <div class="cover-mask">
                  <el-icon v-if="index === 0"><Check /></el-icon>
                </div>
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="coverDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="coverDialogVisible = false">
                  确定
                </el-button>
              </span>
            </template>
          </el-dialog>
        </template>
      </template>
      
      <!-- 内容输入区域 - 仅在有图片或视频时显示 -->
      <template v-if="fileList.length > 0 || videoUrl">
        <div class="cover-title">正文内容</div>
        <div class="push-content">
          <el-input
            v-model="note.title"
            maxlength="20"
            show-word-limit
            type="text"
            placeholder="请输入标题"
            class="input-title"
          />
          <el-input
            v-model="note.content"
            maxlength="250"
            show-word-limit
            :autosize="{ minRows: 4, maxRows: 5 }"
            type="textarea"
            placeholder="填写更全面的描述信息，让更多的人看到你吧❤️"
            class="input-content"
          />
          <!-- 非闲置模式下的标签和按钮 -->
          <template v-if="currentTab !== 'idle'">
            <div class="btns">
              <button class="css-fm44j css-osq2ks dyn">
                <span class="btn-content" @click="addTag"># 话题</span></button
              ><button class="css-fm44j css-osq2ks dyn">
                <span class="btn-content"><span>@</span> 用户</span></button
              ><button class="css-fm44j css-osq2ks dyn">
                <span class="btn-content">
                  <div class="smile"></div>
                  表情
                </span>
              </button>
            </div>
            <!-- 标签列表 -->
            <div class="tag-list">
              <el-tag
                v-for="tag in dynamicTags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
                class="tag-item"
                type="danger"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                style="width: 3.125rem"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputBlur"
              />
              <el-button
                v-else
                type="warning"
                size="small"
                @click="showInput"
                plain
                id="tagContainer"
                :disabled="dynamicTags.length >= 5"
              >
                + 标签
              </el-button>
            </div>
            <div class="hot-tag">
              <span class="tag-title-text">推荐标签：</span>
              <el-tag
                v-for="tag in hotTags"
                :key="tag"
                class="hot-tag-item"
                type="warning"
                @click="selectHotTag(tag)"
                :disabled="dynamicTags.length >= 5"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </div>
        
        <template v-if="currentTab === 'idle'">
          <div class="categorys">
            <label for="category">选择分类：</label>
            <el-cascader
              ref="CategoryCascaderRef"
              v-model="categoryList"
              :options="categoryOptions"
              @change="handleCategoryChange"
              :props="props"
              placeholder="请选择分类"
              clearable
            />
          </div>
          <div class="location">
            <span>宝贝位置：</span>
            <div class="location-container" @click="getLocation">
              <el-icon><Location/></el-icon>
                <span class="location-text">{{ locationInfo || '点击获取位置' }}</span>
            </div>
          </div>
          <div class="product">
            <el-form-item label="发货方式" prop="postType">
              <el-radio-group v-model="product.postType" required>
                <el-radio label="0">邮寄</el-radio>
                <el-radio label="1">自提</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="价格">
              <el-input-number
                required
                controls-position="right"
                v-model="product.price"
                :precision="2"
                :step="1"
                :min="0"
                placeholder="请输入价格"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="原价">
              <el-input-number
                required
                controls-position="right"
                v-model="product.originalPrice"
                :precision="2"
                :step="1"
                :min="0"
                placeholder="请输入原价"
              ></el-input-number>
            </el-form-item>
          </div>
        </template>
        <template v-else>
          <div class="categorys">
            <label for="category">选择分类：</label>
            <el-cascader
              ref="CategoryCascaderRef"
              v-model="categoryList"
              :options="categoryOptions"
              @change="handleCategoryChange"
              :props="props"
              placeholder="请选择分类"
              clearable
            />
          </div>
          <!-- <div class="albums">
            <label>选择专辑：</label>
            <el-select
              v-model="album"
              placeholder="请选择专辑"
              style="width: 200px"
              clearable
            >
              <el-option
                v-for="item in albumOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              >
                <div class="album-option">
                  <span class="album-title">{{ item.title }}</span>
                  <span class="album-count" v-if="item.noteCount"> - {{ item.noteCount }}篇</span>
                </div>
              </el-option>
            </el-select>
          </div> -->
          <!-- <div class="location">
            <span>添加地点：</span>
            <div class="location-container" @click="getLocation">
              <el-icon><Location/></el-icon>
                <span class="location-text">{{ locationInfo || '点击获取位置' }}</span>
            </div>
          </div> -->
        </template>
        <div class="submit">
          <el-button type="danger" loading :disabled="true" v-if="pushLoading">发布</el-button>
          <button class="publishBtn" @click="publish()" v-else>
            <span class="btn-content">发布</span>
          </button>
          <button class="clearBtn">
            <span class="btn-content" @click="resetData">取消</span>
          </button>
        </div>
        <!-- 右侧预览区域 -->
        <!-- <div class="preview-container">
          <div class="mobile-wrapper">
            手机状态栏 
            <div class="status-bar">
              <span class="time">00:00</span>
              <div class="right-icons">
                <span class="signal">
                  <svg
                    t="1736094828268"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="12068"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M128 597.333333h128v213.333334H128v-213.333334z m213.333333-128h128v341.333334H341.333333v-341.333334z m213.333334-128h128v469.333334h-128V341.333333z m213.333333-128h128v597.333334h-128V213.333333z"
                      fill="#000000"
                      p-id="12069"
                    ></path>
                  </svg>
                </span>
                <span class="wifi">
                  <svg
                    t="1736094928620"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="13444"
                    width="14"
                    height="14"
                  >
                    <path
                      d="M0 352.832l93.12 98.752c231.296-245.44 606.464-245.44 837.76 0L1024 352.832C741.44 53.056 283.008 53.056 0 352.832z m372.352 395.008L512 896l139.648-148.16c-76.8-81.92-202.048-81.92-279.296 0zM186.24 550.4l93.12 98.752c128.448-136.32 336.96-136.32 465.408 0L837.824 550.4c-179.648-190.592-471.488-190.592-651.648 0z"
                      fill="#000000"
                      p-id="13445"
                    ></path>
                  </svg>
                </span>
                <span class="battery">
                  <svg
                    t="1736094793598"
                    class="icon"
                    viewBox="0 0 1828 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="10942"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M60.275337 3.248868l-57.025203 57.025203C-8.154907 10.377019 10.378284-8.156172 60.275337 3.248868z"
                      fill="#2c2c2c"
                      p-id="10943"
                    ></path>
                    <path
                      d="M1822.354106 673.295002V345.400086c0-28.512601 0-61.302093-22.810081-79.835284-41.343272-34.215122-48.471422-79.835284-54.173943-126.881077-7.12815-59.876463-25.661341-111.199146-88.389064-135.434857H60.275337C28.911475 10.377019 10.378284 28.91021 3.250134 60.274071v898.146946C24.634585 1014.020589 71.680377 1022.57437 128.70558 1024h1459.845194c95.517215 0 134.009227-29.938232 153.968048-122.604186 12.830671-59.876463 12.830671-122.604186 67.004613-166.798719 15.681931-14.256301 12.830671-39.917642 12.830671-61.302093z m-104.070995-52.748312c1.42563 31.363862-11.405041 44.194532-41.343272 38.492012-57.025203-11.405041-64.153353 18.533191-64.153354 67.004613 1.42563 188.18317 0 188.18317-186.757539 188.183169-420.560871 0-839.696112-1.42563-1260.256984 1.425631-62.727723 0-81.260914-15.681931-79.835284-78.409654 4.27689-222.398291 2.85126-446.222213 0-668.620504-1.42563-54.173943 15.681931-68.430243 68.430244-67.004614 235.228962 1.42563 467.606664 0 699.984365 0 232.377702 0 464.755404 1.42563 697.133105-1.42563 55.599573-1.42563 71.281504 15.681931 65.578984 68.430244-4.27689 32.789492 1.42563 67.004613-1.425631 99.794105-2.85126 54.173943-5.70252 102.645365 72.707134 88.389064 25.661341-4.27689 29.938232 14.256301 29.938232 35.640752 0 75.558394-1.42563 152.542418 0 228.100812z"
                      fill="#2c2c2c"
                      p-id="10944"
                    ></path>
                    <path
                      d="M851.500027 814.432379c-199.58821 0-399.17642-1.42563-598.76463 1.42563-51.322683 1.42563-62.727723-14.256301-62.727724-64.153353 2.85126-166.798718 2.85126-332.171807 0-498.970525 0-38.492012 8.55378-52.748313 49.897053-52.748313 407.730201 1.42563 816.886031 1.42563 1224.616232 0 41.343272 0 51.322683 12.830671 51.322682 52.748313-1.42563 168.224349-2.85126 336.448697 0 506.098676 1.42563 49.897053-17.107561 57.025203-61.302093 57.025202-199.58821-2.85126-402.02768-1.42563-603.04152-1.42563z"
                      fill="#2c2c2c"
                      p-id="10945"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
             内容区域 
            <div class="content-area">
             详情模式 
              <template v-if="previewMode === 'detail'">
               顶部用户信息 
                <div class="user-bar">
                  <div class="left">
                    <i class="el-icon-arrow-left"></i>
                    <el-avatar :src="userInfo.avatar" :size="30" />
                    <span class="username">{{ userInfo.username }}</span>
                  </div>
                  <div class="right">
                    <span class="follow-btn">关注</span>
                    <i class="el-icon-share"></i>
                  </div>
                </div>
               预览内容区 
                <div class="preview-content">
                  <div class="media-container">
                     根据当前模式显示图片或视频 
                    <template v-if="currentTab === 'image'">
                      <div v-if="fileList.length > 0" class="image-slider">
                       左右切换按钮 
                        <div class="arrow left" @click="prevImage" v-show="currentIndex > 0">
                        </div>
                        <div class="arrow right" @click="nextImage" v-show="currentIndex < fileList.length - 1">
                        </div>

                         图片展示 
                        <img :src="fileList[currentIndex].url" class="preview-image" />

                         底部指示点 
                        <div class="indicator-dots" v-if="fileList.length > 1">
                          <span
                            v-for="(_, index) in fileList"
                            :key="index"
                            :class="['dot', { active: currentIndex === index }]"
                            @click="currentIndex = index"
                          ></span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <video v-if="videoUrl" :src="videoUrl" class="preview-video" controls></video>
                    </template>
                  </div>
                  底部信息 
                  <div class="post-info">
                    <p class="post-time">发表于 {{ getCurrentTime() }}   北京</p>
                    底部操作栏 
                    <div class="action-bar">
                      <div class="action-item">
                        <i class="el-icon-chat-dot-round"></i>
                        <span>说点什么...</span>
                      </div>
                      <div class="action-icons">
                        <i class="el-icon-star-off"></i>
                        <i class="el-icon-collection"></i>
                        <i class="el-icon-more"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
               双列模式 
              <template v-else>
                 App 导航栏 
                <div class="app-header">
                  <div class="nav-tabs">
                    <span class="mobile-tab-item">关注</span>
                    <span class="mobile-tab-item active">发现</span>
                    <span class="mobile-tab-item">附近</span>
                  </div>
                </div>

                搜索栏 
                <div class="search-bar">
                  <i class="el-icon-search"></i>
                  <span class="placeholder">🔍搜索笔记，商品和用户</span>
                </div>

                 分类标签栏 
                <div class="category-tabs">
                  <div class="tab-scroll">
                    <span class="category-tab-item active">推荐</span>
                    <span class="category-tab-item">时尚穿搭</span>
                    <span class="category-tab-item">个人护理</span>
                    <span class="category-tab-item">绘画</span>
                    <span class="category-tab-item">食谱</span>
                    <span class="category-tab-item">数码</span>
                  </div>
                </div>
                <div class="grid-view">
                  <div class="grid-item" v-if="currentTab === 'image' && fileList.length > 0">
                    <img :src="fileList[0].url" class="grid-image" />
                    <div class="grid-info">
                      <p class="grid-title">{{ note.title || "请输入标题" }}</p>
                      <div class="grid-user">
                        <el-avatar :src="userInfo.avatar" :size="20" />
                        <span>{{ userInfo.username }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="grid-item" v-else-if="currentTab === 'video' && videoUrl">
                    <video :src="videoUrl" class="grid-image" />
                    <div class="grid-info">
                      <p class="grid-title">{{ note.title || "请输入标题" }}</p>
                      <div class="grid-user">
                        <el-avatar :src="userInfo.avatar" :size="20" />
                        <span>{{ userInfo.nickname }}</span>
                      </div>
                    </div>
                  </div>
                 添加一些示例项目
                  <div class="grid-item placeholder" v-for="n in 5" :key="n">
                    <div class="grid-image placeholder"></div>
                    <div class="grid-info">
                      <p class="grid-title">示例笔记标题</p>
                      <div class="grid-user">
                        <div class="avatar placeholder"></div>
                        <span>用户名</span>
                      </div>
                    </div>
                  </div>
                   底部导航栏 
                  <div class="bottom-nav">
                    <div class="nav-item active">
                      <i class="el-icon-house"></i>
                      <span>首页</span>
                    </div>
                    <div class="nav-item">
                      <i class="el-icon-shopping-bag-1"></i>
                      <span>商城</span>
                    </div>
                    <div class="nav-item publish">
                      <div class="publish-btn">
                        <i class="el-icon-plus">+</i>
                      </div>
                    </div>
                    <div class="nav-item">
                      <i class="el-icon-message"></i>
                      <span>消息</span>
                    </div>
                    <div class="nav-item">
                      <i class="el-icon-user"></i>
                      <span>我</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
         在 content-area 底部添加切换按钮 
           <div class="view-switcher">
            <div :class="['switch-btn', { active: previewMode === 'detail' }]" @click="previewMode = 'detail'">
              详情
            </div>
            <div :class="['switch-btn', { active: previewMode === 'grid' }]" @click="previewMode = 'grid'">双列</div>
          </div>
        </div> -->
      </template>
    </div>
    <div v-else>
      <el-empty description="用户未登录" />
    </div>
     <!--抽屉 地址编辑-->
     <div>
      <el-drawer
        @close-drawer="closeDrawer"
        :show-close="false"
        v-model="drawer"
        direction="rtl"
        size="40%"
        title="选择位置"
      >
        <addressEdit @close-drawer="closeDrawer" @select-location="handleLocationSelect"/>
      </el-drawer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { CloseBold, Location, Plus, RefreshLeft, RefreshRight, Upload } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import type { UploadUserFile, CascaderProps, ElInput } from "element-plus";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/store/userStore";
// import { getAlbumData } from "@/api/album";
import { getCategoryTreeData } from "@/api/category";
import { saveNoteByDTO, getNoteById, updateNoteByDTO } from "@/api/note";
import { getTagByKeyword } from "@/api/tag";
import { getFileFromUrl } from "@/utils/util";
// import addressEdit from "./address-edit.vue";
// import Schema from "async-validator";

const props: CascaderProps = {
  label: "title",
  value: "id",
  checkStrictly: true, // 允许选择父级节点
};
const CategoryCascaderRef = ref<any>(null);

// const rules = {
//   title: { required: true, message: "标题不能为空" },
//   content: { required: true, message: "内容不能为空" },
//   category: { required: true, message: "分类不能为空" },
// };
// const validator = new Schema(rules);

const userStore = useUserStore();
const route = useRoute();
const videoRef = ref<HTMLVideoElement>();
const previewMode = ref("detail"); // 预览模式：'detail' | 'grid'
const fileList = ref<UploadUserFile[]>([]);
const videoUrl = ref("");
const coverUrl = ref("");
const locationInfo = ref("");
const coverDialogVisible = ref(false);

// 添加标签页相关的响应式数据
const currentTab = ref("image");
const tabs = [
  { key: "image", label: "上传图文" },
  { key: "video", label: "上传视频" },
  // { key: "idle", label: "发布闲置" },
];

interface AlbumOption {
  id: string | number;
  title: string;
  noteCount?: number;
}

const userInfo = ref<any>({});
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const uploadHeader = ref({
  accessToken: userStore.getToken(),
});
const categoryList = ref<Array<any>>([]);
const album = ref('');
const categoryOptions = ref([]);
const albumOptions = ref<AlbumOption[]>([]);
const note = ref<any>({});
const product = ref<any>({});
const showTagState = ref(false);
const selectTagList = ref<Array<any>>([]);
const currentPage = ref(1);
const pageSize = 10;
const tagTotal = ref(0);
const pushLoading = ref(false);
const isLogin = ref(false);
const inputValue = ref("");
const dynamicTags = ref<Array<string>>([]);
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();
const hotTags = ref<Array<string>>([]);
const currentIndex = ref(0);
const maxImageCount = ref(9);
const drawer = ref(false);

// 获取位置信息的方法
const getLocation = async () => {
  drawer.value = true;
};

const closeDrawer = () => {
  drawer.value = false;
};

// 添加选择位置的处理方法
const handleLocationSelect = (location: any) => {
  if (location) {
    // 更新显示的位置信息
    locationInfo.value = `${location.province || ''} ${location.city || ''} ${location.name}`.trim();
    // 更新笔记对象中的位置信息
    note.value = {
      ...note.value,
      longitude: location.location.lng,
      latitude: location.location.lat,
      address: location.address,
      locationName: location.name,
      province: location.province,
      city: location.city
    };
  }
  drawer.value = false;
};

const handleClearAndReupload = () => {
  ElMessageBox.confirm("重新上传将会清空已上传的图片，是否继续？", "提示", {
    confirmButtonText: "重新上传",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger",
  })
    .then(() => {
      fileList.value = []; // 清空文件列表
      // ElMessage({
      //   type: "success",
      //   message: "已清空，请重新上传",
      // });
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
    });
};

const handleClear = () => {
  ElMessageBox.confirm("将会清空已上传的视频，是否继续？", "提示", {
    confirmButtonText: "重新上传",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger",
  })
    .then(() => {
      videoUrl.value = ""; // 清空视频
      // ElMessage({
      //   type: "success",
      //   message: "已清空，请重新上传",
      // });
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
    });
};

const handleExceed = (files: File[]) => {
  ElMessage.warning(`最多只能上传${maxImageCount.value}张图片，本次选择了${files.length}张图片`);
};

// 处理图片预览
const handlePreview = (file: UploadUserFile) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const handleImageChange = (file: UploadUserFile) => {
  // 检查图片数量限制
  if (fileList.value.length >= maxImageCount.value) {
    ElMessage.warning(`最多只能上传${maxImageCount.value}张图片`);
    return false;
  }
  if (file.raw) {
    // 为上传的文件创建预览URL
    const url = URL.createObjectURL(file.raw);
    fileList.value.push({
      name: file.name,
      url: url,
      raw: file.raw,
    });
  }
};

// 切换图片方法
const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextImage = () => {
  if (currentIndex.value < fileList.value.length - 1) {
    currentIndex.value++;
  }
};
// 添加获取当前时间的方法
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 添加标签切换方法
const handleTabChange = (tab: string) => {
  currentTab.value = tab;
  resetData(); // 切换标签时重置表单
};

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const handleInputBlur = () => {
  inputVisible.value = false;
  // showTagState.value = false;
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
    addTag();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
  showTagState.value = false;
};

watch(
  () => inputValue.value,
  () => {
    addTag();
  }
);

// 监听外部点击
onMounted(() => {
  if (!isLogin.value) {
    return;
  }
  document.getElementById("container")!.addEventListener("click", function (e) {
    var event = e || window.event;
    var target = event.target || (event.srcElement as any);
    // if(target.id == "name") {
    const tagContainer = document.getElementById("tagContainer");
    if (tagContainer == null) return;

    if (tagContainer.contains(target)) {
      console.log("in");
    } else {
      showTagState.value = false;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    }
  });
});

const addTag = () => {
  selectTagList.value = [];
  currentPage.value = 1;
  setData();
  showTagState.value = true;
};

const setData = () => {
  getTagByKeyword(currentPage.value, pageSize, inputValue.value).then((res) => {
    const { records, total } = res.data;
    selectTagList.value.push(...records);
    tagTotal.value = total;
  });
};

const selectHotTag = (val: string) => {
  if (dynamicTags.value.length < 5) {
    dynamicTags.value.push(val);
  } else {
    // 如果已选择 5 个标签，弹出提示
    ElMessage.warning("最多只能选择 5 个标签");
  }
};

const handleCategoryChange = (ids: Array<any>) => {
  categoryList.value = ids;
  // 选中后关闭下拉框
  CategoryCascaderRef.value.togglePopperVisible();
};

const getCategoryList = async () => {
  try {
    const res = await getCategoryTreeData();
    categoryOptions.value = res.data;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

const getAlbumList = async (userId: string) => {
  try {
    const res = await getAlbumData(userId);
    albumOptions.value = res.data.map((album: any) => ({
      id: album.id,
      title: album.title,
      noteCount: album.imgCount
    }));
  } catch (error) {
    console.error('获取专辑失败:', error);
  }
};

const getHotTag = async () => {
  getTagByKeyword(1, pageSize, "").then((res) => {
    const { records } = res.data;
    records.forEach((item: any) => {
      hotTags.value.push(item.title);
    });
  });
};

const getNoteByIdMethod = (noteId: string) => {
  getNoteById(noteId).then((res) => {
    const { data } = res;
    note.value = data;
    const urls = JSON.parse(data.urls);
    urls.forEach((item: string) => {
      const fileName = item.substring(item.lastIndexOf("/") + 1);
      getFileFromUrl(item, fileName).then((res: any) => {
        fileList.value.push({ name: fileName, url: item, raw: res });
      });
    });
    categoryList.value.push(data.cpid);
    categoryList.value.push(data.cid);

    data.tagList.forEach((item: any) => {
      dynamicTags.value.push(item.title);
    });
  });
};

const publish = async () => {
  // 验证
  if (!note.value.title || categoryList.value.length <= 0) {
    ElMessage.error("请填写标题并选择分类");
    return;
  }
  if (currentTab.value === "image" && fileList.value.length <= 0) {
    ElMessage.error("请选择要上传的图片");
    return;
  }
  if (currentTab.value === "video" && (!videoUrl.value || !coverUrl.value)) {
    ElMessage.error("请上传视频和封面");
    return;
  }
  try {
    pushLoading.value = true;
    const params = new FormData();
    if (currentTab.value === "image") {
      await handleImagePublish(params);
    } else {
      await handleVideoPublish(params);
    }
    // 提交笔记
    await submitNote(params);
    ElMessage.success("发布成功,请等待审核结果");
    resetData();
  } catch (error) {
    ElMessage.error(`发布失败: ${error}`);
  } finally {
    pushLoading.value = false;
  }
};

// 处理图片发布
const handleImagePublish = async (params: FormData) => {
  // 获取第一张图作为封面
  const firstFile = fileList.value[0];
  if (!firstFile?.url) {
    throw new Error('封面图URL不存在');
  }
  // 转换封面图为文件
  const coverBlob = await fetch(firstFile.url).then(res => res.blob());
  const coverFile = new File([coverBlob], 'cover.jpg', { type: 'image/jpeg' });
  params.append("coverFile", coverFile);
  // 添加所有图片
  for (const file of fileList.value) {
    if (file.raw) {
      params.append("uploadFiles", file.raw);
    }
  }
  // 设置笔记类型和数量
  note.value.noteType = 1;
  note.value.count = fileList.value.length;
  // 计算封面高度
  const coverImage = new Image();
  coverImage.src = firstFile.url;
  await new Promise<void>((resolve) => {
    coverImage.onload = () => {
      const size = coverImage.width / coverImage.height;
      note.value.noteCoverHeight = size >= 1.3 ? 200 : 300;
      resolve();
    };
  });
};

// 处理视频发布
const handleVideoPublish = async (params: FormData) => {
  if (!videoRef.value?.src) {
    throw new Error('视频源不存在');
  }
  // 转换封面为文件
  const coverFile = dataURLtoFile(coverUrl.value, "cover.jpg");
  params.append("coverFile", coverFile);
  // 获取视频文件
  const videoBlob = await fetch(videoRef.value.src).then(res => res.blob());
  params.append("uploadFiles", videoBlob, "video.mp4");
  // 设置笔记类型和数量
  note.value.noteType = 2;
  note.value.count = 1;
};
  
// 抽取提交笔记的公共方法
const submitNote = (params: FormData) => {
  note.value.location = locationInfo.value;
  note.value.cpid = categoryList.value[0];
  note.value.cid = categoryList.value[1];
  note.value.albumId = album.value;
  note.value.tagList = dynamicTags.value;

  const noteData = JSON.stringify(note.value);
  params.append("noteData", noteData);

  if (note.value.id !== null && note.value.id !== undefined) {
    updateNote(params);
  } else {
    saveNote(params);
  }
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const handleChangeCover = () => {
  coverDialogVisible.value = true;
};

const setCoverImage = (index: number) => {
  if (index > 0) {
    const newFileList = [...fileList.value];
    const [selected] = newFileList.splice(index, 1);
    newFileList.unshift(selected);
    fileList.value = newFileList;
  }
};

// 添加视频上传相关方法
const beforeVideoUpload = (file: File) => {
  const isVideo = file.type.startsWith("video/");
  const isLt2GB = file.size / 1024 / 1024 / 1024 < 2;
  if (!isVideo) {
    ElMessage.error("请上传视频文件！");
    return false;
  }
  if (!isLt2GB) {
    ElMessage.error("视频大小不能超过2GB！");
    return false;
  }
  return true;
};

const handleVideoChange = (file: any) => {
  if (file.raw) {
    // 清除旧的视频URL和封面
    if (videoUrl.value && videoUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl.value);
    }
    videoUrl.value = URL.createObjectURL(file.raw);
    // 重置封面，等待视频加载完成后自动截取
    coverUrl.value = "";
  }
};

// 视频加载完成后自动截取第一帧作为封面
const handleVideoLoaded = async () => {
  if (!videoRef.value) return;
  // 确保视频数据已经加载
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
    console.error("Error capturing video frame:", error);
  }
};

// 截取视频当前帧作为封面
const handleCapture = () => {
  if (!videoRef.value) return;
  const video = videoRef.value;
  const canvas = document.createElement("canvas");
  // 设置canvas尺寸为视频的实际尺寸
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  try {
    // 在canvas上绘制当前视频帧
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 将canvas内容转换为base64格式的图片
    coverUrl.value = canvas.toDataURL("image/jpeg", 0.8); // 0.8是图片质量参数
  } catch (error) {
    console.error("Error capturing video frame:", error);
    ElMessage.error("封面截取失败，请重试");
  }
};

// 封面图片上传前验证
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("封面只能是图片格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("封面图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 处理封面图片变更
const handleCoverChange = (file: any) => {
  if (file.raw) {
    coverUrl.value = URL.createObjectURL(file.raw);
  }
};

// 修改视频移除处理方法，同时清除封面
const handleVideoRemove = () => {
  if (videoUrl.value && videoUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(videoUrl.value);
  }
  videoUrl.value = "";
  coverUrl.value = "";
  if (videoRef.value) {
    videoRef.value.onseeked = null; // 清除事件监听
  }
};

// 组件销毁时的清理
onBeforeUnmount(() => {
  handleVideoRemove();
  document.removeEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    }
  });
  fileList.value.forEach((file) => {
    if (file.url && file.url.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }
  });
});

const updateNote = (params: FormData) => {
  updateNoteByDTO(params)
    .then(() => {
      resetData();
      ElMessage.success("修改成功");
    })
    .catch(() => {
      ElMessage.error("修改失败");
    })
    .finally(() => {
      pushLoading.value = false;
    });
};

const saveNote = (params: FormData) => {
  saveNoteByDTO(params)
    .then(() => {
      resetData();
      ElMessage.success("发布成功,请等待审核结果");
    })
    .catch(() => {
      ElMessage.error("发布失败");
    })
    .finally(() => {
      pushLoading.value = false;
    });
};

const resetData = () => {
  note.value = {};
  categoryList.value = [];
  album.value = "";
  fileList.value = [];
  videoUrl.value = "";
  pushLoading.value = false;
  dynamicTags.value = [];
  locationInfo.value = "";
};

const initData = () => {
  userInfo.value = userStore.getUserInfo();
  isLogin.value = userStore.isLogin();
  if (isLogin.value) {
    const noteId = route.query.noteId as string;
    if (noteId !== "" && noteId !== undefined) {
      getNoteByIdMethod(noteId);
    }
    getCategoryList();
    getAlbumList(userInfo.value.id);
    getHotTag();
  }
};

initData();
</script>

<style lang="less" scoped>
// 自定义 drawer 内容区域
:deep(.el-drawer__body) {
  padding: 0;  // 移除默认内边距
  height: 100%;  // 确保内容区域占满高度
  overflow: hidden;  // 防止内容溢出
}

// 自定义 drawer 本身
:deep(.el-drawer) {
  background: #f5f5f5; 
}

:deep(.el-drawer__header) {
  display: none;
}

/* 通用按钮悬浮效果 */
.el-button.el-button--danger.is-link {
  transition: all 0.3s ease;
}

.el-button.el-button--danger.is-link:hover {
  /* 保持按钮文字颜色 */
  color: #ff4d4f !important;
  /* 添加阴影效果 */
  // text-shadow: 0 0 6px rgba(255, 77, 79, 0.3);
  transform: scale(1.1); /* 鼠标移入时按钮稍微放大 */
}

/* 标签按钮悬浮效果 */
.el-tag {
  transition: all 0.3s ease;
}

.el-tag:hover {
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
  transform: translateY(-1px);
}

/* 操作按钮组的悬浮效果 */
.action-buttons .el-button {
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  /* 保持原有颜色 */
  color: #ff4d4f !important;
  /* 添加阴影和微弱上浮效果 */
  // text-shadow: 0 0 6px rgba(255, 77, 79, 0.3);
  transform: scale(1.2); /* 鼠标移入时按钮稍微放大 */
}

/* 发布和取消按钮的悬浮效果 */
.submit button {
  transition: all 0.3s ease !important;
}

.submit .publishBtn:hover {
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
  transform: translateY(-2px) scale(1.02);
}

.submit .clearBtn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px) scale(1.02);
}

.replace-btn {
  margin-top: 10px;
  margin-left: 130px;
}
.tab-container {
  display: flex;
  border-bottom: 2px solid #eee;
  padding: 0 20px;
  margin-top: 30px;
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  color: gray;
  font-size: 16px;
  position: relative;

  &.active {
    color: #ff3a3a;
    font-weight: 500;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #ff3a3a;
    }
  }
}

// 只添加新的上传区域样式
.image-upload-area {
  background: #fff;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;

  :deep(.el-upload) {
    width: 100%;

    .el-upload-dragger {
      width: 100%;
      height: auto;
      padding: 130px 0;
      transition: border-color 0.3s;

      &:hover {
        border-color: #ff2442;
      }

      .upload-placeholder {
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
          margin-bottom: 8px;
        }

        .upload-tip {
          color: #909399;
          font-size: 12px;
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
    }

    .el-upload-dragger.is-dragover {
      border-color: #ff2442;
      background-color: rgba(255, 36, 66, 0.06);

      .upload-icon {
        color: #ff2442;
      }
    }
  }

  .upload-info {
    display: flex;
    justify-content: space-around;
    margin-top: 30px;
    padding: 0 40px;
    align-items: stretch; /* 子元素高度填充 */
    gap: 20px; /* 元素之间的间距 */

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
    .vertical-divider {
      width: 0; /* 宽度为0 */
      border-left: 1px dashed #dcdfe6; /* 左边添加虚线 */
    }
  }
}

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
        padding: 100px 0;
        transition: border-color 0.3s;

        &:hover {
          border-color: #ff2442;
        }
      }

      // 拖拽文件到上传区域时的样式
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
      align-items: stretch; /* 子元素高度填充 */
      gap: 20px; /* 元素之间的间距 */

      .vertical-divider {
        width: 0; /* 宽度为0 */
        border-left: 1px dashed #dcdfe6; /* 左边添加虚线 */
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
    position: relative; // 添加相对定位作为定位上下文

    .video-content {
      width: 100%;
      display: flex;
      margin-left: 20px;

      .video-wrapper {
        flex: 1;

        .uploaded-video {
          max-width: 100%;
          max-height: 400px;
          // width: auto;
          // height: auto;
          object-fit: contain;
          border-radius: 8px;
        }
      }
    }
  }

  .video-uploader {
    width: 100%;
    margin-bottom: -12px;
  }

  .uploaded-video {
    width: 50%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
  }

  .cover-container {
    margin-top: 10px;
    border-top: 1px solid #eee;
    padding-top: 10px;

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
          gap: 10px; // 控制按钮之间的间距

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
      }
    }
  }

  .upload-area {
    width: 100%;
    height: 200px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
      border-color: #ff3a3a;
    }

    .upload-icon {
      font-size: 48px;
      color: #8c939d;
    }

    .upload-text {
      margin: 16px 0 8px;
      font-size: 16px;
      color: #606266;
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
    }
  }
}
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list__item.is-success .el-upload-list__item-status-label) {
  display: none;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

a {
  text-decoration: none;
}

.container {
  flex: 1;
  padding-top: 72px;
  position: relative; // 添加相对定位

  .push-container {
    margin-left: 9vw;
    margin-top: 1vw;
    width: 800px;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: var(--el-box-shadow-lighter);

    .cover-selector {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      padding: 16px;

      .cover-option {
        position: relative;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        aspect-ratio: 1;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;

          .el-icon {
            font-size: 24px;
            color: #fff;
          }
        }

        &:hover .cover-mask {
          opacity: 1;
        }

        &.active {
          border: 2px solid #ff2442;

          .cover-mask {
            opacity: 1;
            background: rgba(255, 36, 66, 0.3);
          }
        }
      }
    }

    .cover-container {
      margin: 20px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #eee;

      .cover-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #333;
      }

      .cover-content {
        margin-left: 1vw;

        .cover-preview {
          display: flex;
          align-items: flex-start;
          gap: 16px;

          .cover-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
          }

          .cover-actions {
            padding-top: 8px;
          }
        }
      }
    }
    
    .header {
      display: flex; /* 使用flex布局 */
      padding: 15px 20px;
      line-height: 2px;
      font-size: 16px;
      font-weight: 400;

      .header-left {
        align-items: center;
      }

      .header-right {
        margin-left: auto; /* 确保右侧元素靠右 */
        align-items: center;

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px; /* 按钮之间的间距 */

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

      .image-count {
        font-size: 14px; /* 可以调整字体大小 */
        color: #909399; /* 使用较浅的颜色 */
        margin-left: 4px; /* 和"发布图文"之间的间距 */
      }
    }

    .img-list {
      width: 650px;
      margin: auto;
      padding: 6px 6px 6px 0px;
    }
    
    .preview-image {
      max-width: 100%; /* 限制图片最大宽度为容器宽度 */
      max-height: 55vh; /* 限制图片最大高度为视窗高度的80% */
      object-fit: contain; /* 保持图片比例 */
      display: block; /* 移除图片底部的空隙 */
      margin: 0 auto; /* 水平居中 */
    }

    /* 可选：调整对话框样式 */
    :deep(.el-dialog) {
      max-width: 50%; /* 对话框最大宽度 */
      margin: 60px auto; /* 对话框居中 */
    }

    .cover-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 1px;
      margin-left: 14px;
    }

    .push-content {
      padding: 16px 12px 16px 12px;
      position: relative;

      .hot-tag {
        .tag-title-text {
          font-size: 0.875rem;
          color: #484848;
          margin: 0.125rem 0;
        }
        .hot-tag-item {
          cursor: pointer;
          margin: 0.3rem 0.3rem 0 0.3rem;
        }
        :hover {
          transform: scale(1.2); /* 鼠标移入时按钮稍微放大 */
        }
      }

      .tag-list {
        margin: 1rem 0;
        .tag-item {
          margin-right: 0.5rem;
        }
      }

      .scroll-tag-container {
        position: absolute;
        width: 98%;
        background-color: #fff;
        z-index: 99999;
        border: 1px solid #f4f4f4;
        height: 300px;
        overflow: auto;

        .scrollbar-tag-item {
          display: flex;
          align-items: center;
          height: 30px;
          margin: 10px;
          text-align: center;
          border-radius: 4px;
          padding-left: 2px;
          color: #484848;
          font-size: 14px;
        }

        .scrollbar-tag-item:hover {
          background-color: #f8f8f8;
        }
      }

      .input-title {
        width: 350px;
        margin-bottom: 12px;
        font-size: 15px;
      }

      .input-content {
        font-size: 14px;
        width: 600px;
      }

      .post-content:empty::before {
        content: attr(placeholder);
        color: #ccc;
        font-size: 14px;
      }

      .post-content {
        cursor: text;
        margin-top: 10px;
        width: 100%;
        min-height: 90px;
        max-height: 300px;
        margin-bottom: 10px;
        background: #fff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 6px 12px 22px;
        outline: none;
        overflow-y: auto;
        text-rendering: optimizeLegibility;
        font-size: 14px;
        line-height: 22px;
      }

      .post-content:focus,
      .post-content:hover {
        border: 1px solid #3a64ff;
      }
    }

    .btns {
      padding: 10px 12px 10px 2px;

      button {
        min-width: 62px;
        width: 62px;
        margin: 0 6px 0 0;
        height: 18px;
      }

      .css-fm44j {
        -webkit-font-smoothing: antialiased;
        appearance: none;
        font-family:
          RedNum,
          RedZh,
          RedEn,
          -apple-system;
        vertical-align: middle;
        text-decoration: none;
        border: 1px solid rgb(217, 217, 217);
        outline: none;
        user-select: none;
        cursor: pointer;
        display: inline-flex;
        -webkit-box-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        align-items: center;
        margin-right: 16px;
        border-radius: 4px;
        background-color: white;
        color: rgb(38, 38, 38);
        height: 24px;
        font-size: 12px;
      }
    }

    .categorys {
      padding: 0 12px 10px 12px;
    }

    .albums {
      padding: 0 12px 10px 12px;
    }

    .location {
      cursor: pointer;
      padding: 0 12px 10px 12px;
    }

    .product {
      cursor: pointer;
      padding: 0 12px 10px 12px;
    }

    .location-container {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      transition: all 0.3s ease; /* 添加过渡效果 */

      .location-text {
        font-size: 14px;
        color: #666;
      }

      .location-text:hover {
        color: #409EFF; /* Element Plus 的主题蓝色 */
      }

      .el-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }

    /* 鼠标悬停效果 */
    .location-container:hover {
      color: #409EFF; /* Element Plus 的主题蓝色 */
    }

    .submit {
      padding: 10px 12px 10px 12px;
      margin-top: 10px;

      button {
        width: 100px;
        height: 36px;
        font-size: 15px;
        display: inline-block;
        margin-left: 250px;
        margin-bottom: 15px;
        cursor: pointer; /* 显示小手指针 */
        transition:
          background-color 0.3s,
          color 0.3s; /* 添加过渡效果 */
      }
      button:hover {
        transform: scale(1.05); /* 鼠标移入时按钮稍微放大 */
      }

      .publishBtn {
        background-color: #ff2442;
        color: #fff;
        border-radius: 24px;
      }

      .clearBtn {
        border-radius: 24px;
        margin-left: 10px;
        border: 1px solid rgb(217, 217, 217);
      }
    }
  }
  // 添加右侧预览样式
  .preview-container {
    position: fixed; // 改为固定定位
    top: 120px; // 调整顶部距离
    left: calc(30vw + 750px); // 根据左侧容器位置计算
    height: calc(100vh - 112px);

    .view-switcher {
      position: absolute;
      bottom: 140px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      background: #f5f5f5;
      border-radius: 20px;
      padding: 2px;
      z-index: 10;

      .switch-btn {
        padding: 6px 20px;
        border-radius: 16px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background: #fff;
          color: #ff2442;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .status-bar {
      height: 44px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: #000;
      background: #fff;

      .time {
        font-weight: 100;
      }

      .right-icons {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .app-header {
      padding: 2px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #f5f5f5;

      .nav-tabs {
        display: flex;
        gap: 24px;

        .mobile-tab-item {
          font-size: 15px;
          color: #666;
          position: relative;
          padding: 4px 0;

          &.active {
            color: #000;
            font-weight: 500;

            &::after {
              content: "";
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 20px;
              height: 2px;
              background: #ff2442;
              border-radius: 1px;
            }
          }
        }
      }
    }

    .search-bar {
      margin: 8px 16px;
      height: 25px;
      background: #f5f5f5;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center; // 内容居中
      padding: 0 16px;
      color: #999;

      .el-icon-search {
        margin-right: 8px;
      }

      .placeholder {
        font-size: 12px;
      }
    }

    .category-tabs {
      padding: 0 12px;

      .tab-scroll {
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        &::-webkit-scrollbar {
          display: none;
        }

        .category-tab-item {
          flex-shrink: 0;
          padding: 8px 8px;
          font-size: 12px;
          color: #666;
          position: relative;

          &.active {
            color: #ff2442;
            font-weight: 500;
          }
        }
      }
    }

    .bottom-nav {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-top: 1px solid #f5f5f5;

      .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #666;
        font-size: 12px;
        gap: 4px;

        &.active {
          color: #ff2442;
        }

        &.publish {
          .publish-btn {
            width: 40px;
            height: 40px;
            background: #ff2442;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 20px;
          }
        }

        i {
          font-size: 20px;
        }
      }
    }

    .grid-view {
      padding: 12px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      overflow-y: auto;
      height: calc(100% + 44px);

      .grid-item {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &.placeholder {
          .grid-image {
            background: #f5f5f5;
          }
          .avatar {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #f5f5f5;
          }
        }

        .grid-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
        }

        .grid-info {
          padding: 8px;

          .grid-title {
            font-size: 12px;
            margin-top: 5px;
            margin-bottom: 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .grid-user {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #999;

            .el-avatar {
              width: 20px;
              height: 20px;
            }
          }
        }
      }
    }

    .mobile-wrapper {
      width: 300px;
      height: 650px;
      background: #fff;
      border-radius: 40px;
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;

      // 手机状态栏
      .status-bar {
        height: 35px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        font-size: 14px;

        .right-icons {
          display: flex;
          gap: 4px;
          align-items: center;
        }
      }

      // 内容区域
      .content-area {
        height: calc(100% - 44px);
        background: #fff;
        overflow-y: auto;

        .user-bar {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f5f5f5;

          .left {
            display: flex;
            align-items: center;
            gap: 12px;

            .avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }

            .username {
              font-size: 15px;
              font-weight: 500;
            }
          }

          .right {
            display: flex;
            align-items: center;
            gap: 16px;

            .follow-btn {
              padding: 4px 12px;
              border-radius: 16px;
              background: #ff2442;
              color: #fff;
              font-size: 14px;
            }
          }
        }

        .preview-content {
          .media-container {
            background: #f8f8f8;
            position: relative;
            overflow: hidden;

            .image-slider {
              width: 100%;
              // height: 100%;
              position: relative;

              .preview-image {
                width: 100%;
                height: 440px;
                // 改用cover而不是contain
                object-fit: cover;
              }

              // 左右箭头样式
              .arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 2;

                &::before {
                  content: "";
                  display: block;
                  width: 12px;
                  height: 12px;
                  border-width: 2px 2px 0 0;
                  border-style: solid;
                  border-color: #fff;
                }

                &.left {
                  left: 14px;
                  &::before {
                    transform: rotate(-135deg);
                  }
                }

                &.right {
                  right: 5px;
                  &::before {
                    transform: rotate(45deg);
                  }
                }
              }

              // 底部指示点样式
              .indicator-dots {
                position: absolute;
                bottom: 5px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 8px;
                z-index: 2;

                .dot {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: rgba(185, 181, 181, 0.5);
                  cursor: pointer;
                  transition: all 0.3s;

                  &.active {
                    background: #f60404;
                    transform: scale(1.2);
                  }
                }
              }
            }
            .preview-video {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .post-info {
            padding: 16px;

            .post-time {
              font-size: 12px;
              color: #999;
              margin-bottom: 8px;
            }

            .post-title {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .post-desc {
              font-size: 14px;
              color: #666;
              margin-bottom: 16px;
            }

            .action-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 12px;
              border-top: 1px solid #f5f5f5;

              .action-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #999;
              }

              .action-icons {
                display: flex;
                gap: 24px;
                color: #666;
              }
            }
          }
        }
      }
    }
  }
}
</style>
