using System;
using System.IO;
using Unosquare.Labs.EmbedIO;
using Unosquare.Labs.EmbedIO.Modules;

namespace Unosquare.Tubular.EmbedioSample
{
    public class Logger : Unosquare.Labs.EmbedIO.ILog
    {
        public void Info(object message)
        {
            InfoFormat(message.ToString(), null);
        }

        public void Error(object message)
        {
            ErrorFormat(message.ToString(), null);
        }

        public void Error(object message, Exception exception)
        {
            ErrorFormat(message.ToString(), null);
            ErrorFormat(exception.ToString(), null);
        }

        private void WriteLine(ConsoleColor color, string format, params object[] args)
        {
            var current = Console.ForegroundColor;
            Console.ForegroundColor = color;
            Console.WriteLine(format, args);
            Console.ForegroundColor = current;
        }

        public void InfoFormat(string format, params object[] args)
        {
            WriteLine(ConsoleColor.Blue, format, args);
        }

        public void WarnFormat(string format, params object[] args)
        {
            WriteLine(ConsoleColor.Yellow, format, args);
        }

        public void ErrorFormat(string format, params object[] args)
        {
            WriteLine(ConsoleColor.Red, format, args);
        }

        public void DebugFormat(string format, params object[] args)
        {
            WriteLine(ConsoleColor.Cyan, format, args);
        }
    }

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
                var assemblyPath = Path.GetDirectoryName(typeof(Program).Assembly.Location);
#if !DEBUG
                // This lets you edit the files without restarting the server.
                return Path.GetFullPath(Path.Combine(assemblyPath, "..\\..\\html"));
#else
                // This is when you have deployed the server.
                return Path.Combine(assemblyPath, "html");
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
            using (var server = new WebServer(url, new Logger()))
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
#if DEBUG
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
