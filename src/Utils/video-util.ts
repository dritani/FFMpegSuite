import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import { ffprint, today } from './util'
import {
  setEnvironmentVariable,
  setFontconfigConfigurationPath,
  setFontDirectory,
} from './react-native-ffmpeg-api-wrapper'


// save differently on Android and iOS // wait, I won't even need this method then (assetPath)
  // what I will need is that RNFS exception on Android.
// duplicate file name deal with: (1)
// assetToFile ?? This seems to copy existing assets in VSCode to file storage
// create a custom App folder with:
// const    AppFolder    =     'DirNameyouwant';
//  const DirectoryPath= RNFS.ExternalStorageDirectoryPath +'/'+ AppFolder;
//  RNFS.mkdir(DirectoryPath);
// DocumentDirectoryPath => here?
// RNFS.writeFile => do I really need this??

// how about on APp start you check if Documents/VideoCompressor exists
// if not, create it
// then with FFMpeg you write to DocumentsDirectory/VideoCompressor instead of CachesDirectory
const getUniqueName = async (fileName, index = 0) => {
  console.log(`INDEX: ${index}`)
  let checkName = fileName,
    ext = ''
  if (index) {
    if (checkName.indexOf('.') > -1) {
      let tokens = checkName.split('.')
      ext = '.' + tokens.pop()
      checkName = tokens.join('.')
    }

    checkName = `${checkName}_${index}${ext}`
  }

  console.log(`checkName: ${checkName}`)

  let existPath = `${RNFS.DocumentDirectoryPath}/${checkName}`
  // console.log(`outputPath: ${RNFS.DocumentDirectoryPath}/${outputPath}`)
  console.log(`existPath: ${existPath}`)

  const nameExists = await VideoUtil.fileExists(existPath)
  console.log(`nameExists: ${nameExists}`)

  if (nameExists) {
    return getUniqueName(fileName, index + 1)
  } else {
    return existPath // encodeURI(existPath)
  }
}

export default class VideoUtil {
  static async assetToFile(assetName) {
    let fullTemporaryPath = VideoUtil.assetPath(assetName)

    if (Platform.OS === 'android') {
      await RNFS.copyFileAssets(assetName, fullTemporaryPath)
        .then(_ =>
          ffprint(`Asset ${assetName} saved to file at ${fullTemporaryPath}.`),
        )
        .catch(err => {
          ffprint(
            `Failed to save asset ${assetName} to file at ${fullTemporaryPath}, err message: ${err.message}, err code: ${err.code}`,
          )
        })
    } else {
      ffprint(`Asset ${assetName} loaded as file at ${fullTemporaryPath}.`)
    }

    return fullTemporaryPath
  }

  static async fileExists(assetName) {
    let exists = await RNFS.exists(assetName)
    console.log(`assetName: ${assetName}`)
    // console.log(`exists: ${exists}`)
    return exists
  }

  static deleteFile(videoFile) {
    return RNFS.unlink(videoFile).catch(_ => _)
  }

  static assetPath(assetName) {
    if (Platform.OS === 'ios') {
      return VideoUtil.iosAssetPath(assetName)
    } else {
      return VideoUtil.androidAssetPath(assetName)
    }
  }

  static androidAssetPath(assetName) {
    return `${RNFS.CachesDirectoryPath}/${assetName}`
  }

  static iosAssetPath(assetName) {
    return `${RNFS.MainBundlePath}/${assetName}`
  }

  static generateEncodeVideoScript(
    image1Path,
    image2Path,
    image3Path,
    videoFilePath,
    videoCodec,
    customOptions,
  ) {
    return (
      "-hide_banner -y -loop 1 -i '" +
      image1Path +
      "'   " +
      '-loop 1 -i   "' +
      image2Path +
      '" ' +
      '-loop 1 -i  "' +
      image3Path +
      '" ' +
      '-filter_complex ' +
      "\"[0:v]setpts=PTS-STARTPTS,scale=w='if(gte(iw/ih,640/427),min(iw,640),-1)':h='if(gte(iw/ih,640/427),-1,min(ih,427))',scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=sar=1/1,split=2[stream1out1][stream1out2];" +
      "[1:v]setpts=PTS-STARTPTS,scale=w='if(gte(iw/ih,640/427),min(iw,640),-1)':h='if(gte(iw/ih,640/427),-1,min(ih,427))',scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=sar=1/1,split=2[stream2out1][stream2out2];" +
      "[2:v]setpts=PTS-STARTPTS,scale=w='if(gte(iw/ih,640/427),min(iw,640),-1)':h='if(gte(iw/ih,640/427),-1,min(ih,427))',scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=sar=1/1,split=2[stream3out1][stream3out2];" +
      '[stream1out1]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=3,select=lte(n\\,90)[stream1overlaid];' +
      '[stream1out2]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=1,select=lte(n\\,30)[stream1ending];' +
      '[stream2out1]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=2,select=lte(n\\,60)[stream2overlaid];' +
      '[stream2out2]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=1,select=lte(n\\,30),split=2[stream2starting][stream2ending];' +
      '[stream3out1]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=2,select=lte(n\\,60)[stream3overlaid];' +
      '[stream3out2]pad=width=640:height=427:x=(640-iw)/2:y=(427-ih)/2:color=#00000000,trim=duration=1,select=lte(n\\,30)[stream3starting];' +
      "[stream2starting][stream1ending]blend=all_expr='if(gte(X,(W/2)*T/1)*lte(X,W-(W/2)*T/1),B,A)':shortest=1[stream2blended];" +
      "[stream3starting][stream2ending]blend=all_expr='if(gte(X,(W/2)*T/1)*lte(X,W-(W/2)*T/1),B,A)':shortest=1[stream3blended];" +
      '[stream1overlaid][stream2blended][stream2overlaid][stream3blended][stream3overlaid]concat=n=5:v=1:a=0,scale=w=640:h=424,format=yuv420p[video]"' +
      ' -map  [video] -vsync 2 -async 1   ' +
      customOptions +
      '-c:v   ' +
      videoCodec.toLowerCase() +
      '  -r 30  ' +
      videoFilePath +
      ' '
    )
  }

  static async generateBasicCompressionScript(filePath, preset, width, height) {
    let crf = 28,
      f_preset = 'fast'
    // preset: 4, 3, 2, 1

    switch (preset) {
      case 4:
        crf = 32
        f_preset = 'veryfast'
        break
      case 3:
        crf = 30
        f_preset = 'faster'
        break
      case 2:
        crf = 28
        f_preset = 'fast'
        break
      case 1:
        crf = 26
        f_preset = 'fast'
        break
      case 0:
        crf = 24
        f_preset = 'medium'
        break
      default:
        break
    }

    // filePath is inputPath
    // libx265 => literally doesn't work
    let command = `-i ${filePath} -c:v libx264 -crf ${crf} -preset ${f_preset} `

    if (width || height) {
      command += `-vf scale="${width}:${height}" `
    }

    let fileName = filePath.substring(
      filePath.lastIndexOf('/') + 1,
      filePath.length,
    )
    let outputPath = await getUniqueName(fileName)
    console.log(`outputPath: ${outputPath}`)

    command += outputPath
    // -vf scale="${width}:${height}"
    // -c:v libx265 -crf ${crf} -preset ${f_preset}
    // CachesDirectoryPath, DocumentDirectoryPath
    // the following works, but 265 does not. Same error as on Mac.
    return command
  }

  static generateAdvancedCompressionScript(
    filePath,
    width, // 720
    height, // 480
    time_start, // 00:01:00
    time_end, // 00:02:00
    volume, // 1.5 => up to 3.0?
    bitrate, // 192k or 1M
    framerate, // 30
    // crf: 18-51? 51 fastest, 28 default.
  ) {
    let command = `-i ${filePath} `

    if (bitrate) {
      command += `-b:v ${bitrate} `
    }

    if (framerate) {
      command += `-r ${framerate} `
    }

    if (time_start || time_end) {
      command += `-ss ${time_start} -to ${time_end} -c copy `
    }

    if (volume) {
      command += `-filter:a "volume=${volume}" `
    }

    if (width || height) {
      command += `-vf scale="${width}:${height}" `
    }

    command += `${RNFS.DocumentDirectoryPath}/output.mp4`

    return command
  }

  // works!!!
  // -ss 00:00:05 -to 00:00:25
  // hh:mm:ss
  // -c copy is needed for this? Indeed!!! Makes it much faster!

  // works!!!
  // -vf scale="${width}:${height}"

  // works!!!
  // -filter:a "volume=${volume}"

  // WRONG???
  // fps=${framerate}
  // actually, it does work, you just forgot to put -vf in front.
  // instead: -r 25


  // possible, but only if you'd like to split audio and video bitrates
  // -b:v ${bitrate} -b:a ${bitrate}
  // for the same bitrate: -b 12000
  // -b is ambiguous: use b:v for video. 
  // 1k, 1M, or 1000000

  // no need for the multiple filter command 
  // -vf "filter1, filter2"
  // comma separated if you do end up needing it.
  // it works:
  // -vf "fps=4,scale=400:200"

  // can combine crf with preset
  // do NOT use ultrafast!! ?????
  // no, don't use 51 CRF you mean
  // leave them all at -fast. All of them. faster => also good, but quality is lower
  // superfast and ultrafast actually are bigger in size, the compression is worse.
  // so either fast or faster for the presets

  // right scale: faster, lossier.
  // make that one crf 30, preset faster

  // 30 faster

  // crf 28 fast

  // crf 26 fast

  // crf 24 medium

  // left scale: slower, lossless
}

// the above trial and erorr: 264
// 264
// superfast
// veryfast
// faster
// fast
// medium – default preset
// slow
// slower
// veryslow


// 265
// ultrafast
// superfast
// veryfast
// faster
// fast
// medium
// slow
// slower
// veryslow
