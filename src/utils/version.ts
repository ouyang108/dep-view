import { exec } from "node:child_process";
import type { ExecException } from "node:child_process";
import { resolve } from "node:dns";
import semver from 'semver';
/**
 * 单个包信息查询（内部方法，无加载）
 * @param dependency 包名
 * @returns { version: 版本号 | null, url: 仓库地址 | null }
 */
const querySinglePackageInfo = (dependency: string): Promise<{
  version: string | null;
  url: string | null;
}> => {
  return new Promise((resolve) => {
    // 调整命令：分别查询 version 和 repository.url（用JSON格式输出更易解析）
    const cmd = `npm view "${dependency}" version repository.url --json`;
    exec(cmd, { timeout: 10000 }, (error: ExecException | null, stdout: string, stderr: string) => {
     
      // 错误处理：执行失败直接返回双null
      if (error || stderr) {
        resolve({ version: null, url: null });
        return;
      }

      try {
        // 解析JSON输出（npm --json 会返回数组：[版本号, 仓库URL]）
        const { version, ['repository.url']: repoInfo } = JSON.parse(stdout.trim());
     
        
        // 处理仓库URL的多种格式（npm返回的repo可能是字符串或{ url: ... }对象）
        let repoUrl: string | null = null;
        if (typeof repoInfo === 'string') {
          repoUrl = repoInfo;
        } else if (repoInfo && typeof repoInfo === 'object' && repoInfo.url) {
          repoUrl = repoInfo.url;
        }

        // 版本号去重/清洗（部分包会返回版本数组，取第一个）
        const cleanVersion = Array.isArray(version) ? version[0] : version;

        resolve({
          version: cleanVersion || null,
          url: repoUrl || null
        });
      } catch (parseError) {
        // JSON解析失败（极少数情况）
        resolve({ version: null, url: null });
      }
    });
  });
};

/**
 * 批量查询npm包最新版本和仓库URL（全局加载，全部完成后停止）
 * @param dependencies 包名数组
 * @returns 映射 { 包名: { version: 版本号 | null, url: 仓库地址 | null } }
 */
const findLatestVersionsAndUrls = async (dependencies: string[]): Promise<Record<string, {
  version: string | null;
  url: string | null;
}>> => {
  return new Promise((resolve) => {
    // 1. 初始化全局加载动画
    const loadingChars = ["|", "/", "-", "\\"];
    let loadingIndex = 0;
    // console.log(`\n开始查询 ${dependencies.length} 个包的版本和仓库地址...`);
    
    // 启动加载动画：每秒更新终端输出
    const loadingInterval = setInterval(() => {
      process.stdout.write(`\r查询中... ${loadingChars[loadingIndex++]}`);
      loadingIndex = loadingIndex % loadingChars.length; // 循环动画
    }, 100);

    // 2. 批量执行所有包的信息查询
    const queryPromises = dependencies.map((dep) => 
      querySinglePackageInfo(dep).then((info) => ({ dep, info }))
    );

    // 3. 等待所有查询完成，停止加载并汇总结果
    Promise.all(queryPromises)
      .then((results) => {
        // 停止加载动画 + 清空加载行
        clearInterval(loadingInterval);
        process.stdout.write("\r\x1B[K"); // ANSI指令清空当前行

        // 汇总结果为 { 包名: { version, url } } 格式
        const packageInfoMap: Record<string, { version: string | null; url: string | null }> = {};
        results.forEach(({ dep, info }) => {
          packageInfoMap[dep] = info;
        });

        // 打印汇总结果（美化输出）
        console.log("\n✅ 所有包查询完成：");
        Object.entries(packageInfoMap).forEach(([dep, { version, url }]) => {
          const versionStr = version ? `v${version}` : "❌ 版本查询失败";
          const urlStr = url ? url : "❌ URL查询失败";
          // console.log(`\n📦 ${dep}:`);
          // console.log(`  版本：${versionStr}`);
          // console.log(`  仓库：${urlStr}`);
        });

        resolve(packageInfoMap);
      })
      .catch((err) => {
        // 异常兜底：停止加载并返回空结果
        clearInterval(loadingInterval);
        process.stdout.write("\r\x1B[K");
        console.error("\n❌ 批量查询异常：", err.message);
        
        // 兜底返回结构一致的空数据
        const emptyMap: Record<string, { version: string | null; url: string | null }> = {};
        dependencies.forEach((dep) => {
          emptyMap[dep] = { version: null, url: null };
        });
        
        resolve(emptyMap);
      });
  });
};






/**
 * 比较当前版本是否为最新版本
 * @param {string} currentVersion - 当前版本（如 ^1.3.1-beta.6、^1.3.14）
 * @param {string} latestVersion - npm 最新版本（如 1.3.2、2.3.3）
 * @returns {object} { isLatest: 是否最新, compareResult: 比较结果（-1/0/1）, currentClean: 清理后的当前版本 }
 */
// function compareVersionIsLatest(name:string) {
 
//   return new Promise((resolve) => {
//     exec(`npm outdated ${name} --json`, (error, stdout, stderr) => {
//       if (error || stderr) {
//         resolve({ isLatest: false});
//         return;
//       }
//       console.log(stdout,'stdout',name)
//       try {
//         const outdatedInfo = JSON.parse(stdout.trim());
//         const isLatest = outdatedInfo[name]?.isLatest || false;
//         const compareResult = semver.compare(outdatedInfo[name]?.current, outdatedInfo[name]?.latest);
//         console.log(compareResult,'compareResult')
//         resolve({ isLatest, compareResult, currentClean: outdatedInfo[name]?.current });
//       } catch (parseError) {
//         console.log('error')
//         resolve({ isLatest: false,  });
//       }
//     });
//   });
// }

export {
  findLatestVersionsAndUrls,
  querySinglePackageInfo, // 可选导出：方便单独查询单个包
  // compareVersionIsLatest
};