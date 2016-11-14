namespace Unosquare.Tubular.Sample.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("SystemUsers")]
    public class SystemUser : Microsoft.AspNet.Identity.IUser
    {
        public SystemUser()
        {
            Roles = new HashSet<SystemRole>();
        }

        public virtual ICollection<SystemRole> Roles { get; set; }

        [Key, StringLength(50), Required]
        public string Id
        {
            get;
            set;
        }

        [StringLength(50), Required]
        public string UserName
        {
            get;
            set;
        }

        [StringLength(50), Required]
        public string Password
        {
            get;
            set;
        }
    }
}