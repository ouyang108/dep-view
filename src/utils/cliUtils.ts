
import { keyword } from "../constant/index.js";
import { findLatestVersionsAndUrls } from "./version.js";
import { objToArr, getName } from "./common.js";
import type {DependencyVersion} from '../types'
type KEY = keyof typeof keyword
type PACKAGE  = {[key:string]:string}
/**
 * 获取依赖版本信息
 * @param packageJson package.json文件内容
 * @param key 依赖类型，默认是Dependencies
 * @returns  {currentDependenciesVersions: DependencyVersion[],dependenciesVersions: DependencyVersion[]}
 */
const getVersionInfo= async (packageJson: Record<string, any>,key:KEY = 'De_pendencies') => {
    // 如果都有，通过npm查找每个依赖的最新版本
    const packageJsonDependencies:PACKAGE = packageJson[keyword[key]];
    // 记录目前Dependencies正在使用的版本
    const currentDependenciesVersions = objToArr(packageJsonDependencies);

    const nameArray = getName(currentDependenciesVersions);
    const latestVersions = await findLatestVersionsAndUrls(nameArray);
   
    // 处理成{currentVersion:'',latestVersion:'',githubUrl:'',name:''}
    const dependenciesVersions = fullDepMessage(latestVersions,packageJsonDependencies);
   
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
const fullDepMessage = (latestVersions: Record<string, { version: string | null; url: string  |null}>,currentDependenciesVersions: PACKAGE): DependencyVersion[] => {
   const dependenciesVersions: DependencyVersion[]= []
    for(const  i in latestVersions) {
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
       obj.name = i|| '';
       dependenciesVersions.push(obj);
    } 
    return dependenciesVersions;
}
export {
    getVersionInfo,
}