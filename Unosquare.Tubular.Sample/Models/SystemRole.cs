namespace Unosquare.Tubular.Sample.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("SystemRoles")]
    public class SystemRole : Microsoft.AspNet.Identity.IRole
    {
        public SystemRole()
        {
            Users = new HashSet<SystemUser>();
        }

        public virtual ICollection<SystemUser> Users { get; set; }

        [Key, StringLength(50), Required]
        public string Id
        {
            get;
            set;
        }

        [StringLength(50), Required]
        public string Name
        {
            get;
            set;
        }
    }
}