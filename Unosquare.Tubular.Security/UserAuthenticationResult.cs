namespace Unosquare.Tubular.Security
{
    using Microsoft.AspNet.Identity;
    using System;

    /// <summary>
    /// Represents a user authentication result
    /// </summary>
    public class UserAuthenticationResult
    {
        private UserAuthenticationResult()
        {
            // prevent instantiation. Using Factory Methods instead
        }

        /// <summary>
        /// Gets or sets a value indicating whether this instance is valid.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance is valid; otherwise, <c>false</c>.
        /// </value>
        public bool IsValid { get; protected set; }
        /// <summary>
        /// Gets or sets the user.
        /// </summary>
        /// <value>
        /// The user.
        /// </value>
        public IUser User { get; protected set; }
        /// <summary>
        /// Gets or sets the roles.
        /// </summary>
        /// <value>
        /// The roles.
        /// </value>
        public IRole[] Roles { get; protected set; }
        /// <summary>
        /// Gets or sets the error message.
        /// </summary>
        /// <value>
        /// The error message.
        /// </value>
        public string ErrorMessage { get; protected set; }

        /// <summary>
        /// Creates the authorized result.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="roles">The roles.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentException">
        /// Object cannot be null;user
        /// or
        /// Object cannot be null;roles
        /// </exception>
        static public UserAuthenticationResult CreateAuthorizedResult(IUser user, IRole[] roles)
        {
            if (user == null) throw new ArgumentException("Object cannot be null", "user");
            if (roles == null) throw new ArgumentException("Object cannot be null", "roles");

            var result = new UserAuthenticationResult()
            {
                User = user,
                Roles = roles,
                IsValid = true,
                ErrorMessage = null
            };

            return result;
        }

        /// <summary>
        /// Creates the error result.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <returns></returns>
        static public UserAuthenticationResult CreateErrorResult(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                message = "Invalid credentials.";

            var result = new UserAuthenticationResult()
            {
                User = null,
                Roles = null,
                IsValid = false,
                ErrorMessage = message
            };

            return result;
        }
   
    }
}
