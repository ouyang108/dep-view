
import { keyword } from "../constant/index.js";
import { findLatestVersionsAndUrls ,} from "./version.js";
import { objToArr, getName } from "./common.js";
import { exec } from 'child_process';

import type { DependencyVersion } from '../types'
type KEY = keyof typeof keyword
type PACKAGE = { [key: string]: string }
/**
 * 获取依赖版本信息
 * @param packageJson package.json文件内容
 * @param key 依赖类型，默认是Dependencies
 * @returns  {currentDependenciesVersions: DependencyVersion[],dependenciesVersions: DependencyVersion[]}
 */
const getVersionInfo = async (packageJson: Record<string, any>, key: KEY = 'De_pendencies') => {
    // 如果都有，通过npm查找每个依赖的最新版本
    const packageJsonDependencies: PACKAGE = packageJson[keyword[key]];
    // 记录目前Dependencies正在使用的版本
    const currentDependenciesVersions = objToArr(packageJsonDependencies);

    const nameArray = getName(currentDependenciesVersions);
    const latestVersions = await findLatestVersionsAndUrls(nameArray);

    // 处理成{currentVersion:'',latestVersion:'',githubUrl:'',name:''}
    const dependenciesVersions = fullDepMessage(latestVersions, packageJsonDependencies);

    return {
        currentDependenciesVersions,
        dependenciesVersions,
    }
}
/**
 * 合并依赖版本信息
 * @param latestVersions 最新版本信息
 * @param currentDependenciesVersions 当前依赖版本信息
 * @returns 依赖版本信息
 */
const fullDepMessage = (latestVersions: Record<string, { version: string | null; url: string | null }>, currentDependenciesVersions: PACKAGE): DependencyVersion[] => {
    const dependenciesVersions: DependencyVersion[] = []
    for (const i in latestVersions) {
        const obj: DependencyVersion = {
            currentVersion: '',
            latestVersion: '',
            githubUrl: '',
            name: '',
        }
        //    TODO: 从currentDependenciesVersions中取出currentVersion
        obj.currentVersion = currentDependenciesVersions[i] || '';
        obj.latestVersion = latestVersions?.[i]?.version || '';
        obj.githubUrl = latestVersions?.[i]?.url || '';
        obj.name = i || '';
        
        // compareVersionIsLatest(obj.name)
        dependenciesVersions.push(obj);
    }
    return dependenciesVersions;
}
// 查找对应依赖的依赖
// 主函数必须改成async，才能用await
async function getDependenciesWithVersions(dependenciesVersions: DependencyVersion[]): Promise<DependencyVersion[]> {
  // 遍历每个item，并行执行npm view命令
  const promiseList = dependenciesVersions.map(async (item) => {
    const name = item.name;
    try {
      // 并行获取dependencies和devDependencies（Promise.all）
      const [depsStdout, devDepsStdout] = await Promise.all([
        execPromise(`npm view ${name} dependencies --json`),
        execPromise(`npm view ${name} devDependencies --json`)
      ]);
      // 赋值（此时已经拿到npm命令的结果）
      item.dependencies = jsonParse(depsStdout as string);
      item.devDependencies = jsonParse(devDepsStdout as string);
    } catch (err) {
      // 单个包失败不影响整体，兜底为空对象
      console.error(`处理${name}失败:`, err);
      item.dependencies = {};
      item.devDependencies = {};
    }
    return item;
  });

  // 等待所有包的异步操作完成
  const resultVersions = await Promise.all(promiseList);
  
  // 此时所有item的依赖字段都已赋值，再返回
  console.log(resultVersions, '所有依赖的依赖（已赋值）');
  return resultVersions;
}



// 封装exec为Promise，方便异步等待
function execPromise(command:string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`执行失败: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// 封装你的jsonParse逻辑（带兜底）
function jsonParse(str:string) {
  try {
    const trimmed = str.trim();
    return trimmed ? JSON.parse(trimmed) : {};
  } catch (e) {
    // console.warn('JSON解析失败，返回空对象:', e.message);
    return {};
  }
}
export {
    getVersionInfo,
    getDependenciesWithVersions
}