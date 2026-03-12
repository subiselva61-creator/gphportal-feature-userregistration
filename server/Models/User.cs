using System.Text.Json.Serialization;
using Newtonsoft.Json.Converters;
using Ghp.Portal.Service.Services;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Ghp.Portal.Service.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Name { get => $"{FirstName} {LastName}"; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string Address { get; set; }

        public string BusinessName { get; set; }

        public string Vat { get; set; }

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.NotPaid;

        public string[] Roles { get; set; } = new string[] { "User" };

    }

    public class UserViewModal : User
    {
        public UserViewModal(User user, JwtService jwtService)
        {
            Id = user.Id;
            FirstName = user.FirstName;
            LastName = user.LastName;
            BusinessName = user.BusinessName;
            Email = user.Email;
            Address = user.Address;
            Vat = user.Vat;
            PaymentStatus = user.PaymentStatus;
            Roles = user.Roles;
            Token = jwtService.CreateAuthenticationToken(user);
        }
        public string Token { get; set; }
    }


    public class Project
    {
        public Project()
        {
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string[] LatLon { get; set; }
        public string Geographic { get; set; }
        public string ProductionType { get; set; }
        public string ProjectedYear { get; set; }
        public string Capacity { get; set; }
        public ProjectStatus Status { get; set; }
    }


    public class ProjectFilter
    {
        public ProjectFilter()
        {
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string[] Region { get; set; }
        public string[] Status { get; set; }
        public string[] Year { get; set; }
        public string[] Bankable { get; set; }
    }
    public class Filter
    {
        public string region { get; set; }
        public string status { get; set; }
        public string year { get; set; }
        public string bankable { get; set; }
    }
    public class Investor
    {
        public Investor()
        {
        }
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Geography { get; set; }
        public string Country { get; set; }
        public string InvestmentSize { get; set; }
        public string Strategy { get; set; }
        public string Conditions { get; set; }
        public List<double> LatLon { get; set; }
        public List<string> NotableActivity { get; set; }
        public List<Project> Projects { get; set; }
        public string Logo { get; set; }
    }


    [JsonConverter(typeof(StringEnumConverter))]
    public enum ProjectStatus
    {
        None,
        New,
        Live,
        Delayed,
        FinDifficult,
        Stopped
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum PaymentStatus
    {
        None,
        Initiated,
        Progress,
        Paid,
        NotPaid,
    }
}