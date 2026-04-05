function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    var guests = payload.guests || [];

    // One row per guest
    guests.forEach(function(guest) {
      sheet.appendRow([
        timestamp,
        guest.name,
        guest.group,
        guest.email,
        guest.attending,
        guest.arrives  || '',
        guest.onsite   || '',
        guest.dietary  || '',
        guest.note     || ''
      ]);
    });

    // One summary email to you per submission
    var summary = guests.map(function(g) {
      var parts = [g.name + ': ' + g.attending];
      if (g.arrives)  parts.push('Arrives ' + g.arrives);
      if (g.onsite)   parts.push('Onsite: ' + g.onsite);
      if (g.dietary)  parts.push('Dietary: ' + g.dietary);
      return parts.join(' | ');
    }).join('\n');

    var first = guests[0] || {};
    var emails = guests.map(function(g) { return g.name + ': ' + (g.email || 'N/A'); }).join(', ');
    var body = 'New RSVP from ' + (first.group || 'Unknown') + '\n\n'
             + summary + '\n\n'
             + (first.note ? 'Note: ' + first.note + '\n\n' : '')
             + 'Emails: ' + emails;

    var recipients = ['natalieandjordi@gmail.com'];
    recipients.forEach(function(addr) {
      MailApp.sendEmail({ to: addr, subject: 'RSVP: ' + (first.group || 'New Response'), body: body });
    });

    // Confirmation email to the guest
    sendConfirmationEmail(guests);

    return ContentService.createTextOutput('ok');
  } catch(err) {
    return ContentService.createTextOutput('error: ' + err.toString());
  }
}

function sendConfirmationEmail(guests) {
  // Collect unique emails to avoid sending duplicates
  var sent = {};

  guests.forEach(function(g) {
    var email = (g.email || '').trim();
    if (!email || sent[email]) return;
    sent[email] = true;

    var firstName = (g.name || '').split(' ')[0];

    var lines = [];
    lines.push('Hi ' + firstName + ',');
    lines.push('');
    lines.push("We've received your RSVP for Natalie & Jordi's wedding! Here's a summary:");
    lines.push('');

    guests.forEach(function(gg) {
      lines.push('  ' + gg.name + ' \u2014 ' + gg.attending);
      if (gg.attending === 'Yes') {
        if (gg.arrives)  lines.push('    Arriving: ' + gg.arrives);
        if (gg.onsite)   lines.push('    Staying onsite: ' + gg.onsite);
        if (gg.dietary)  lines.push('    Dietary needs: ' + gg.dietary);
      }
      lines.push('');
    });

    if (guests[0].note) {
      lines.push('Your note: "' + guests[0].note + '"');
      lines.push('');
    }

    // Venmo info for onsite guests
    var onsiteCount = 0;
    guests.forEach(function(gg) {
      if (gg.attending === 'Yes' && gg.onsite === 'Yes') onsiteCount++;
    });
    if (onsiteCount > 0) {
      var total = onsiteCount * 275;
      lines.push('---');
      lines.push('');
      lines.push('ONSITE ACCOMMODATION');
      lines.push('The fee for staying onsite at Wildhaven is $275 per person.');
      lines.push('Total for your group: $' + total + ' (' + onsiteCount + (onsiteCount === 1 ? ' guest' : ' guests') + ' \u00d7 $275)');
      lines.push('');
      lines.push('Please Venmo Natalie at: @Natali-Dunn');
      lines.push('(https://venmo.com/u/Natali-Dunn)');
      lines.push('');
    }

    lines.push('If anything changes, just submit the form again and we\'ll update your info.');
    lines.push('');
    lines.push('See you in Sonoma!');
    lines.push('\u2014 Natalie & Jordi');

    MailApp.sendEmail({
      to: email,
      subject: "RSVP Confirmation \u2014 Natalie & Jordi's Wedding",
      body: lines.join('\n')
    });
  });
}
