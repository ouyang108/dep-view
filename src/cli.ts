#! /usr/bin/env node
import process from "node:process";
import path from "node:path";
import chalk from "chalk";
import fs from "node:fs";
import cac from "cac";
import { keyword } from "./constant/index.js";
import type { DependencyVersion } from './types'
import { getVersionInfo } from "./utils/cliUtils.js";
import { createHostServer } from "./server.js";

const cli = cac("dep-view");

// 获取用户当前工作目录
const currentWorkingDir = process.cwd();
// 判断当前工作目录是否有package.json文件
const packageJsonPath = path.join(currentWorkingDir, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.log(chalk.red("当前目录不是一个npm项目"));
  process.exit(1);
}
// 如果有package.json文件，就读取它
const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
const packageJson = JSON.parse(packageJsonContent);
// 检查package.json文件是否有dependencies字段
if (!packageJson[keyword.De_pendencies] && !packageJson[keyword.Dev_Dependencies] && !packageJson[keyword.Peer_Dependencies]) {
  console.log(chalk.red(`package.json文件没有${keyword.De_pendencies}、${keyword.Dev_Dependencies}、${keyword.Peer_Dependencies}字段`));
  process.exit(1);
}

// 全局变量记录
let currentDependenciesVersions: { name: string; version: string | undefined; }[] = [];
let latestVersions: DependencyVersion[] = [];
cli.command('depth',"深度查询依赖，会列出所有依赖的依赖").action(async () => {
   if(currentDependenciesVersions.length === 0) {
    try {
      latestVersions = (await getVersionInfo(packageJson)).dependenciesVersions;
      // console.log(latestVersions,'depth');
      createHostServer()
    } catch (error) {
      console.log(chalk.red("获取依赖版本信息失败"));
      process.exit(1);
    }
   }
})
cli
  .command('', '查询依赖版本信息，只列出直接依赖')
  .action(async () => {
   console.log('all')
    try {
      latestVersions = (await getVersionInfo(packageJson)).dependenciesVersions;
      console.log(latestVersions,'all');
    } catch (error) {
      console.log(chalk.red("获取依赖版本信息失败"));
      process.exit(1);
    }
   
  })


cli.help();

// 解析命令行参数
cli.parse();