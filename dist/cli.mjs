#! /usr/bin/env node
import process$1 from "node:process";
import path from "node:path";
import chalk from "chalk";
import fs, { readFileSync } from "node:fs";
import cac from "cac";
import { exec } from "node:child_process";
import { H3, eventHandler, serve, serveStatic } from "h3";
import { fileURLToPath } from "node:url";
import { join } from "pathe";
import { readFile, stat } from "node:fs/promises";
import { lookup } from "mrmime";

//#region src/constant/index.ts
const keyword = {
	De_pendencies: "dependencies",
	Dev_Dependencies: "devDependencies",
	Peer_Dependencies: "peerDependencies"
};

//#endregion
//#region src/utils/version.ts
/**
* 单个包信息查询（内部方法，无加载）
* @param dependency 包名
* @returns { version: 版本号 | null, url: 仓库地址 | null }
*/
const querySinglePackageInfo = (dependency) => {
	return new Promise((resolve) => {
		exec(`npm view "${dependency}" version repository.url --json`, { timeout: 1e4 }, (error, stdout, stderr) => {
			if (error || stderr) {
				resolve({
					version: null,
					url: null
				});
				return;
			}
			try {
				const { version, ["repository.url"]: repoInfo } = JSON.parse(stdout.trim());
				let repoUrl = null;
				if (typeof repoInfo === "string") repoUrl = repoInfo;
				else if (repoInfo && typeof repoInfo === "object" && repoInfo.url) repoUrl = repoInfo.url;
				resolve({
					version: (Array.isArray(version) ? version[0] : version) || null,
					url: repoUrl || null
				});
			} catch (parseError) {
				resolve({
					version: null,
					url: null
				});
			}
		});
	});
};
/**
* 批量查询npm包最新版本和仓库URL（全局加载，全部完成后停止）
* @param dependencies 包名数组
* @returns 映射 { 包名: { version: 版本号 | null, url: 仓库地址 | null } }
*/
const findLatestVersionsAndUrls = async (dependencies) => {
	return new Promise((resolve) => {
		const loadingChars = [
			"|",
			"/",
			"-",
			"\\"
		];
		let loadingIndex = 0;
		const loadingInterval = setInterval(() => {
			process.stdout.write(`\r查询中... ${loadingChars[loadingIndex++]}`);
			loadingIndex = loadingIndex % loadingChars.length;
		}, 100);
		const queryPromises = dependencies.map((dep) => querySinglePackageInfo(dep).then((info) => ({
			dep,
			info
		})));
		Promise.all(queryPromises).then((results) => {
			clearInterval(loadingInterval);
			process.stdout.write("\r\x1B[K");
			const packageInfoMap = {};
			results.forEach(({ dep, info }) => {
				packageInfoMap[dep] = info;
			});
			console.log("\n✅ 所有包查询完成：");
			Object.entries(packageInfoMap).forEach(([dep, { version, url }]) => {
				version && `${version}`;
			});
			resolve(packageInfoMap);
		}).catch((err) => {
			clearInterval(loadingInterval);
			process.stdout.write("\r\x1B[K");
			console.error("\n❌ 批量查询异常：", err.message);
			const emptyMap = {};
			dependencies.forEach((dep) => {
				emptyMap[dep] = {
					version: null,
					url: null
				};
			});
			resolve(emptyMap);
		});
	});
};

//#endregion
//#region src/utils/common.ts
const objToArr = (obj) => {
	return Object.keys(obj).map((key) => ({
		name: key,
		version: obj[key]
	}));
};
const getName = (arr) => {
	return arr.map((item) => item.name);
};

//#endregion
//#region src/utils/cliUtils.ts
/**
* 获取依赖版本信息
* @param packageJson package.json文件内容
* @param key 依赖类型，默认是Dependencies
* @returns  {currentDependenciesVersions: DependencyVersion[],dependenciesVersions: DependencyVersion[]}
*/
const getVersionInfo = async (packageJson$1, key = "De_pendencies") => {
	const packageJsonDependencies = packageJson$1[keyword[key]];
	const currentDependenciesVersions$1 = objToArr(packageJsonDependencies);
	return {
		currentDependenciesVersions: currentDependenciesVersions$1,
		dependenciesVersions: fullDepMessage(await findLatestVersionsAndUrls(getName(currentDependenciesVersions$1)), packageJsonDependencies)
	};
};
/**
* 合并依赖版本信息
* @param latestVersions 最新版本信息
* @param currentDependenciesVersions 当前依赖版本信息
* @returns 依赖版本信息
*/
const fullDepMessage = (latestVersions$1, currentDependenciesVersions$1) => {
	const dependenciesVersions = [];
	for (const i in latestVersions$1) {
		const obj = {
			currentVersion: "",
			latestVersion: "",
			githubUrl: "",
			name: ""
		};
		obj.currentVersion = currentDependenciesVersions$1[i] || "";
		obj.latestVersion = latestVersions$1?.[i]?.version || "";
		obj.githubUrl = latestVersions$1?.[i]?.url || "";
		obj.name = i || "";
		dependenciesVersions.push(obj);
	}
	return dependenciesVersions;
};

//#endregion
//#region src/server.ts
const distDir = fileURLToPath(new URL("../dist/public", import.meta.url));
const createHostServer = (latestVersions$1) => {
	const app = new H3();
	app.use("/message/**", eventHandler(() => {
		console.log("message", latestVersions$1);
		return {
			code: 200,
			message: latestVersions$1
		};
	}));
	app.use("/**", eventHandler(async (event) => {
		const result = await serveStatic(event, {
			fallthrough: true,
			getContents: (id) => {
				console.log(id, "id");
				return readFile(join(distDir, id));
			},
			getMeta: async (id) => {
				const stats = await stat(join(distDir, id)).catch(() => {});
				if (!stats || !stats.isFile()) return;
				return {
					type: lookup(id),
					size: stats.size,
					mtime: stats.mtimeMs
				};
			}
		});
		if (!result) {
			console.log("没有找到", event.req.url);
			event.res.headers.set("Content-Type", "text/html;charset=UTF-8");
			return readFileSync(join(distDir, "index.html"), "utf-8");
		} else return result;
	}));
	serve(app, { port: 3e3 });
};

//#endregion
//#region src/cli.ts
const cli = cac("dep-view");
const currentWorkingDir = process$1.cwd();
const packageJsonPath = path.join(currentWorkingDir, "package.json");
if (!fs.existsSync(packageJsonPath)) {
	console.log(chalk.red("当前目录不是一个npm项目"));
	process$1.exit(1);
}
const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
const packageJson = JSON.parse(packageJsonContent);
if (!packageJson[keyword.De_pendencies] && !packageJson[keyword.Dev_Dependencies] && !packageJson[keyword.Peer_Dependencies]) {
	console.log(chalk.red(`package.json文件没有${keyword.De_pendencies}、${keyword.Dev_Dependencies}、${keyword.Peer_Dependencies}字段`));
	process$1.exit(1);
}
let currentDependenciesVersions = [];
let latestVersions = [];
cli.command("depth", "深度查询依赖，会列出所有依赖的依赖").action(async () => {
	if (currentDependenciesVersions.length === 0) try {
		latestVersions = (await getVersionInfo(packageJson)).dependenciesVersions;
		console.log(latestVersions, "depth");
		createHostServer(latestVersions);
	} catch (error) {
		console.log(chalk.red("获取依赖版本信息失败"));
		process$1.exit(1);
	}
});
cli.command("", "查询依赖版本信息，只列出直接依赖").action(async () => {
	console.log("all");
	try {
		latestVersions = (await getVersionInfo(packageJson)).dependenciesVersions;
		console.log(latestVersions, "all");
	} catch (error) {
		console.log(chalk.red("获取依赖版本信息失败"));
		process$1.exit(1);
	}
});
cli.help();
cli.parse();

//#endregion
export {  };