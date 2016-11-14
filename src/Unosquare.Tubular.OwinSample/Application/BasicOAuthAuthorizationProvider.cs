namespace Unosquare.Tubular.Sample.Application
{
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.Owin.Security.OAuth;

    /// <summary>
    /// Basic OAuth authorization provider
    /// </summary>
    public class BasicOAuthAuthorizationProvider : OAuthAuthorizationServerProvider
    {
        private const string OAuthInvalidGrant = "invalid_grant";
        private const string OAuthAllowOriginHeader = "Access-Control-Allow-Origin";

        /// <summary>
        /// Authentication Task
        /// </summary>
        public Func<OAuthGrantResourceOwnerCredentialsContext, Task<UserAuthenticationResult>> AuthenticateAsync { get; protected set; }

        /// <summary>
        /// Initialize the authorization provider
        /// </summary>
        /// <param name="authenticateFunction">The Authenticate function</param>
        public BasicOAuthAuthorizationProvider(Func<OAuthGrantResourceOwnerCredentialsContext, Task<UserAuthenticationResult>> authenticateFunction)
        {
            if (authenticateFunction == null)
                throw new ArgumentException("An authentication function must be provided", nameof(authenticateFunction));

            AuthenticateAsync = authenticateFunction;

            OnValidateClientAuthentication = context =>
            {
                string clientId;
                string clientSecret;
                if (context.TryGetFormCredentials(out clientId, out clientSecret))
                {
                    // validate client id and and client secret
                }

                context.Validated();
                return Task.FromResult<object>(null);
            };

            OnGrantResourceOwnerCredentials = async context =>
            {
                context.OwinContext.Response.Headers.Add(OAuthAllowOriginHeader, new[] { "*" });
                var authenticateResult = await AuthenticateAsync(context);

                if (authenticateResult.IsValid)
                {
                    var identity = new ClaimsIdentity(context.Options.AuthenticationType);
                    identity.AddClaim(new Claim(ClaimTypes.Name, authenticateResult.User.Id));
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, authenticateResult.User.UserName));

                    foreach (var role in authenticateResult.Roles)
                    {
                        identity.AddClaim(new Claim(ClaimTypes.Role, role.Id));
                    }

                    context.Validated(identity);
                }
                else
                {
                    context.SetError(OAuthInvalidGrant, authenticateResult.ErrorMessage);
                }
            };
        }

    }
}
