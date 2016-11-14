using System;
using System.IO;
using System.Reflection;
using Unosquare.Labs.EmbedIO;
using Unosquare.Labs.EmbedIO.Modules;

namespace Unosquare.Tubular.EmbedioSample
{
    internal class Program
    {
        /// <summary>
        /// Gets the HTML root path.
        /// </summary>
        /// <value>
        /// The HTML root path.
        /// </value>
        public static string HtmlRootPath
        {
            get
            {
                var assemblyPath = Path.GetDirectoryName(typeof(Program).GetTypeInfo().Assembly.Location);
#if !DEBUG
                // This lets you edit the files without restarting the server.
                return Path.GetFullPath(Path.Combine(assemblyPath, "..\\..\\html"));
#else
                // This is when you have deployed the server.
                return Path.Combine(assemblyPath, "..\\html");
#endif
            }
        }

        /// <summary>
        /// Defines the entry point of the application.
        /// </summary>
        /// <param name="args">The arguments.</param>
        private static void Main(string[] args)
        {
            var url = "http://localhost:9696/";

            if (args.Length > 0)
                url = args[0];

            // Our web server is disposable. Note that if you don't want to use logging,
            // there are alternate constructors that allow you to skip specifying an ILog object.
            using (var server = new WebServer(url, new Labs.EmbedIO.Log.SimpleConsoleLog()))
            {
                // First, we will configure our web server by adding Modules.

                server.RegisterModule(new WebApiModule());
                server.Module<WebApiModule>().RegisterController<PeopleController>();

                // Here we setup serving of static files
                server.RegisterModule(new StaticFilesModule(HtmlRootPath)
                {
                    UseRamCache = true,
                    DefaultExtension = ".html"
                });
                
                // Once we've registered our modules and configured them, we call the RunAsync() method.
                // This is a non-blocking method (it return immediately) so in this case we avoid
                // disposing of the object until a key is pressed.
                server.RunAsync();

                // Fire up the browser to show the content if we are debugging!
#if DEBUG && NET452
                var browser = new System.Diagnostics.Process()
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo(url) {UseShellExecute = true}
                };
                browser.Start();
#endif
                // Wait for any key to be pressed before disposing of our web server.
                // In a service we'd manage the lifecycle of of our web server using
                // something like a BackgroundWorker or a ManualResetEvent.
                Console.ReadKey(true);
            }
        }
    }
}
