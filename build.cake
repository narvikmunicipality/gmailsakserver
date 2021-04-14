#tool nuget:?package=NUnit.ConsoleRunner&version=3.4.0
#addin nuget:?package=Cake.Npm&version=0.17.0
using System.Text.RegularExpressions;

var sourceFiles = "./src/**/*";
var envFile = File("./src/.env");
var packageJson = new FilePath("./package.json");
var packageLockJson = new FilePath("./package-lock.json");
var publishDirectory = Directory("./publish");
var zipFile = publishDirectory + new FilePath("GmailSakServer.zip");

Task("Clean")
    .Does(() =>
{
    if (DirectoryExists(publishDirectory))
    {
        DeleteDirectory(publishDirectory, new DeleteDirectorySettings { Recursive = true });
    }

    CreateDirectory(publishDirectory);
});

Task("npm install")
    .IsDependentOn("Clean")
    .Does(() =>
{
    NpmInstall();
});

Task("Jasmine tests")
    .IsDependentOn("npm install")
    .Does(() =>
{
    var testSettings = new NpmRunScriptSettings { ScriptName = "test" };
    NpmRunScript(testSettings);
});

Task("Verify .env")
    .IsDependentOn("npm install")
    .Does(() =>
{
    if (!FileExists(envFile)) 
    {
        throw new Exception("\n.env does not exist in \"src\" folder!\nIt's required for the packaged GmailSakServer to get configured properly.\nUse .env.example as a base configuration or reuse an existing configuration.");
    }
});

Task("Package")
    .IsDependentOn("Verify .env")
    .Does(() =>
{
    var files = new FilePathCollection();
    files.Add(packageJson);
    files.Add(packageLockJson);
    files.Add(GetFiles(sourceFiles));

    Zip("./", zipFile, files);
});

Task("Default")
    .IsDependentOn("Package");

RunTarget(Argument("target", "Default"));
