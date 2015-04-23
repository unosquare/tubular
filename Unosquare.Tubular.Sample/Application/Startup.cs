using System.Web.Routing;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Unosquare.Tubular.Sample.Application;
using Unosquare.Tubular.Sample.Models;

[assembly: OwinStartup(typeof(Startup))]

namespace Unosquare.Tubular.Sample.Application
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var config = new HttpConfiguration();
            OAuth.Configure(app);
            WebApi.Configure(config);

            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            app.UseWebApi(config);
        }

        private static class OAuth
        {
            public static void Configure(IAppBuilder app)
            {
                var authFunc =
                    new Func<OAuthGrantResourceOwnerCredentialsContext, Task<Security.UserAuthenticationResult>>((c) =>
                    {
                        var task = new Task<Security.UserAuthenticationResult>(() =>
                        {

                            using (var context = new SampleDbContext())
                            {
                                var user =
                                    context.SystemUsers.FirstOrDefault(
                                        u => u.Id == c.UserName && u.Password == c.Password);

                                if (user != null)
                                {
                                    var roles = user.Roles.ToArray();
                                    return Security.UserAuthenticationResult.CreateAuthorizedResult(user, roles);
                                }

                                return Security.UserAuthenticationResult.CreateErrorResult("Invalid credentials");
                            }


                        });

                        task.Start();
                        return task;
                    });

                var authServerOptions = new OAuthAuthorizationServerOptions()
                {
                    AllowInsecureHttp = true,
                    TokenEndpointPath = new PathString("/token"),
                    AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                    Provider = new Security.BasicOAuthAuthorizationProvider(authFunc),
                    AuthenticationMode = Microsoft.Owin.Security.AuthenticationMode.Active,
                    AuthenticationType = "Bearer"
                };

                var bearerAuthOptions = new OAuthBearerAuthenticationOptions()
                {
                    AuthenticationType = authServerOptions.AuthenticationType,
                    AuthenticationMode = authServerOptions.AuthenticationMode,
                    AccessTokenFormat = authServerOptions.AccessTokenFormat,
                    AccessTokenProvider = authServerOptions.AccessTokenProvider,
                };

                // Token Generation
                app.UseOAuthAuthorizationServer(authServerOptions);
                app.UseOAuthBearerAuthentication(bearerAuthOptions);
            }
        }

        private static class WebApi
        {
            public static void Configure(HttpConfiguration config)
            {
                // Web API configuration and services
                var json = config.Formatters.JsonFormatter;
                json.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.Objects;
                config.Formatters.Remove(config.Formatters.XmlFormatter);

                // Web API routes
                config.MapHttpAttributeRoutes();

                config.Routes.MapHttpRoute(
                    name: "DefaultApi",
                    routeTemplate: "api/{controller}/{id}",
                    defaults: new {id = RouteParameter.Optional}
                    );

                RouteTable.Routes.MapPageRoute("Default", "{*anything}", "~/index.html");
            }
        }

    }
}