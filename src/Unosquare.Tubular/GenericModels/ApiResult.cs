using System;

namespace Unosquare.Tubular.GenericModels
{
    /// <summary>
    /// Represents a basic generic API Result object
    /// </summary>
    public class ApiResult
    {
        /// <summary>
        /// The ok status
        /// </summary>
        public const string OkStatus = "OK";
        /// <summary>
        /// The error status
        /// </summary>
        public const string ErrorStatus = "Error";

        /// <summary>
        /// Gets or sets the status.
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Gets or sets the message.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Gets or sets the affected count.
        /// </summary>
        public int AffectedCount { get; set; }

        /// <summary>
        /// Create a new valid result with an optional message.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <returns></returns>
        public static ApiResult Ok(string message = null)
        {
            return new ApiResult { Status = OkStatus, Message = message };
        }

        /// <summary>
        /// Create a new invalid result with an exception.
        /// </summary>
        /// <param name="ex">The ex.</param>
        /// <returns></returns>
        public static ApiResult Error(Exception ex)
        {
            return new ApiResult { Status = ErrorStatus, Message = ex.Message };
        }
    }
}