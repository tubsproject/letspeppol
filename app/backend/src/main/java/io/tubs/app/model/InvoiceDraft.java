package io.tubs.app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@NoArgsConstructor
public class InvoiceDraft extends GenericEntity {

    private String type;
    private String number;
    private String customer;
    private String date;
    @Lob
    private String xml;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_partner_company"))
    private Company company;

    public InvoiceDraft(String type, String number, String customer, String date, String xml) {
        this.type = type;
        this.number = number;
        this.customer = customer;
        this.date = date;
        this.xml = xml;
    }

}
